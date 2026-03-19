#!/usr/bin/env python3
"""
AI Detector using nodriver (stealth browser automation)

This consolidated detector combines features from both detector.py and stealth_detector.py:
- Retry logic with exponential backoff (3 retries: 2s, 4s, 8s delays)
- Proper wait conditions using wait_for_selector for results
- Enhanced browser args with comprehensive stealth options
- Optional cookie loading from files (gptzero.txt, etc.)
- Better result validation (verify percentages are 0-100)
- @with_retry decorator for automatic retry handling
- Helper functions: extract_percentage(), validate_percentage()

Usage:
    python detector.py --text "Your text here" --detector gptzero
    python detector.py --text "Your text here" --detector gptzero --retries 3
    python detector.py --text "Your text here" --detector gptzero --cookies-dir ./cookies
"""

import asyncio
import functools
import json
import re
import sys
import time
from pathlib import Path
from typing import Any, Callable, Dict, List, Optional

try:
    import nodriver as uc
except ImportError:
    print("Error: nodriver not installed. Run: pip install nodriver", file=sys.stderr)
    sys.exit(1)

# =============================================================================
# RETRY DECORATOR AND CONFIGURATION
# =============================================================================

# Retry configuration with exponential backoff
# Delays: 2s, 4s, 8s (doubles each retry)
RETRY_DELAYS = [2, 4, 8]
DEFAULT_MAX_RETRIES = 3


def with_retry(
    max_retries: int = DEFAULT_MAX_RETRIES,
    delays: List[float] = RETRY_DELAYS,
    exceptions: tuple = (Exception,)
):
    """
    Retry decorator with exponential backoff.
    
    This decorator automatically retries a function on failure, waiting longer
    between each attempt. The delays follow an exponential backoff pattern:
    - Retry 1: wait delays[0] seconds (2s)
    - Retry 2: wait delays[1] seconds (4s)
    - Retry 3: wait delays[2] seconds (8s)
    
    Args:
        max_retries: Maximum number of retry attempts (default: 3)
        delays: List of delay seconds between retries (default: [2, 4, 8])
        exceptions: Tuple of exception types to catch and retry on
        
    Returns:
        Decorated function that automatically retries on failure
        
    Example:
        @with_retry(max_retries=3, delays=[2, 4, 8])
        async def fetch_data(url):
            return await browser.get(url)
    """
    def decorator(func: Callable) -> Callable:
        @functools.wraps(func)
        async def async_wrapper(*args, **kwargs):
            last_exception = None
            
            for attempt in range(max_retries + 1):
                try:
                    return await func(*args, **kwargs)
                except exceptions as e:
                    last_exception = e
                    
                    if attempt < max_retries:
                        delay = delays[min(attempt, len(delays) - 1)]
                        print(f"  Retry {attempt + 1}/{max_retries} after {delay}s delay (error: {e})")
                        await asyncio.sleep(delay)
                    else:
                        print(f"  All {max_retries} retries exhausted")
            
            # If we get here, all retries failed
            raise last_exception
        
        @functools.wraps(func)
        def sync_wrapper(*args, **kwargs):
            last_exception = None
            
            for attempt in range(max_retries + 1):
                try:
                    return func(*args, **kwargs)
                except exceptions as e:
                    last_exception = e
                    
                    if attempt < max_retries:
                        delay = delays[min(attempt, len(delays) - 1)]
                        print(f"  Retry {attempt + 1}/{max_retries} after {delay}s delay (error: {e})")
                        time.sleep(delay)
                    else:
                        print(f"  All {max_retries} retries exhausted")
            
            raise last_exception
        
        # Return appropriate wrapper based on whether function is async
        if asyncio.iscoroutinefunction(func):
            return async_wrapper
        return sync_wrapper
    
    return decorator


# =============================================================================
# STEALTH BROWSER ARGUMENTS
# =============================================================================

# Comprehensive stealth browser arguments for avoiding detection
# These args disable various browser features that can be used to detect automation
STEALTH_BROWSER_ARGS = [
    "--disable-blink-features=AutomationControlled",
    "--no-sandbox",
    "--disable-dev-shm-usage",
    "--disable-gpu",
    "--disable-blink-features=AdsHIghlightFPS",
    "--disable-infobars",
    "--disable-extensions",
    "--disable-plugins",
    "--disable-popup-blocking",
    "--profile-directory=Default",
    "--disable-session-crashed-bubble",
    "--disable-features=TranslateUI",
    "--disable-ipc-flooding-protection",
    "--disable-renderer-backgrounding",
    "--enable-features=NetworkService,NetworkServiceInProcess",
    "--force-color-profile=srgb",
    "--metrics-recording-only",
    "--disable-background-timer-throttling",
    "--disable-backgrounding-occluded-windows",
    "--disable-client-side-phishing-detection",
    "--disable-crash-reporter",
    "--disable-oopr-debug-crash-dump",
    "--no-crash-upload",
    "--disable-low-res-tiling",
    "--log-level=3",
    "--silent-debugger-extension-api",
    "--disable-async-ipc",
    "--disable-hang-monitor",
    "--disable-prompt-on-repost",
    "--disable-default-apps",
    "--disable-sync",
    "--ignore-certificate-errors",
    "--disable-component-extensions-with-background-pages",
    "--disable-default-prompt-for-downloads",
    "--disable-translate",
    "--disable-domain-reliability",
    "--disable-features=AudioServiceOutOfProcess",
    "--disable-gesture-requirement-detection-for-media",
    "--disable-password-manager",
    "--disable-websockets",
    "--disable-webrtc",
    "--no-first-run",
    "--no-default-browser-check",
]


# =============================================================================
# HELPER FUNCTIONS
# =============================================================================

def extract_percentage(text: str, patterns: Optional[List[str]] = None) -> Optional[int]:
    """
    Extract AI percentage from text using multiple regex patterns.
    
    This function tries several common patterns for AI detection percentages
    and returns the first match found. Validates the extracted percentage is 0-100.
    
    Args:
        text: Text to search for percentage patterns
        patterns: Optional custom regex patterns (uses defaults if not provided)
        
    Returns:
        Extracted percentage as integer (0-100), or None if not found/invalid
        
    Example:
        >>> extract_percentage("This text is 85% AI generated")
        85
        >>> extract_percentage("AI probability: 42%")
        42
    """
    if patterns is None:
        patterns = [
            r"(\d+)%\s*AI",
            r"AI[:\s]+(\d+)%",
            r"(\d+)%\s*probability.*AI",
            r"Your Text is.*?(\d+)%\s*AI",
            r"completely\s+(\d+)%\s*AI",
            r"likely\s+(\d+)%\s*AI",
            r"(\d+)%",
        ]
    
    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE | re.DOTALL)
        if match:
            try:
                percentage = int(match.group(1))
                # Validate percentage is in valid range
                if validate_percentage(percentage):
                    return percentage
            except (ValueError, IndexError):
                continue
    
    return None


def validate_percentage(value: Any) -> bool:
    """
    Validate that a percentage value is within the valid range (0-100).
    
    Args:
        value: Value to validate (should be integer or convertible to integer)
        
    Returns:
        True if value is a valid percentage (0-100), False otherwise
        
    Example:
        >>> validate_percentage(50)
        True
        >>> validate_percentage(150)
        False
        >>> validate_percentage(-5)
        False
        >>> validate_percentage("not a number")
        False
    """
    try:
        percent = int(value)
        return 0 <= percent <= 100
    except (ValueError, TypeError):
        return False


def parse_netscape_cookies(filepath: str) -> List[Dict[str, Any]]:
    """
    Parse a Netscape-format cookie file.
    
    Netscape cookie files have the following tab-separated format:
    domain\tflag\tpath\texpiration\tname\tvalue
    
    Lines starting with # are comments and are ignored.
    Empty lines are also ignored.
    
    Args:
        filepath: Path to the Netscape-format cookie file
        
    Returns:
        List of cookie dictionaries with keys: domain, flag, path, 
        expiration, name, value
        
    Example:
        >>> cookies = parse_netscape_cookies("gptzero.txt")
        >>> print(cookies[0])
        {'domain': '.gptzero.me', 'flag': True, 'path': '/', ...}
    """
    cookies = []
    
    with open(filepath, "r") as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#"):
                continue
            
            parts = line.split("\t")
            if len(parts) >= 7:
                try:
                    exp = int(float(parts[4])) if parts[4] != "0" else -1
                except ValueError:
                    exp = -1
                    
                cookie = {
                    "domain": parts[0],
                    "flag": parts[1] == "TRUE",
                    "path": parts[2],
                    "expiration": exp,
                    "name": parts[5],
                    "value": parts[6],
                }
                cookies.append(cookie)
    
    return cookies


def load_cookies_for_domain(
    domain: str,
    cookies_dir: Optional[Path] = None
) -> List[Dict[str, Any]]:
    """
    Load cookies from the cookie file for a given domain.
    
    This function looks for cookie files in the cookies directory that match
    the domain. The expected files are:
    - gptzero.txt for gptzero.me
    - zerogpt.txt for zerogpt.com
    - winston.txt for gowinston.ai
    - originality.txt for originality.ai
    
    Args:
        domain: Domain to load cookies for (e.g., "gptzero.me")
        cookies_dir: Optional directory containing cookie files
        
    Returns:
        List of cookies for the domain, or empty list if no file found
        
    Example:
        >>> cookies = load_cookies_for_domain("gptzero.me")
        >>> print(f"Loaded {len(cookies)} cookies")
    """
    if cookies_dir is None:
        base_dir = Path(__file__).parent.parent
        cookies_dir = base_dir
    
    cookie_files = {
        "gptzero.me": "gptzero.txt",
        "gowinston.ai": "winston.txt",
        "originality.ai": "originality.txt",
        "zerogpt.com": "zerogpt.txt",
    }
    
    for domain_key, filename in cookie_files.items():
        if domain_key in domain:
            cookie_path = cookies_dir / filename
            if cookie_path.exists():
                return parse_netscape_cookies(str(cookie_path))
            break
    
    return []


# =============================================================================
# DETECTOR CLASSES
# =============================================================================

class BaseDetector:
    """
    Base class for all AI detectors with common functionality.
    
    Provides retry logic, cookie handling, and browser management.
    All detector classes should inherit from this base class.
    
    Attributes:
        URL: The URL of the detector service
        detector_name: Name identifier for the detector
    """
    
    URL = ""
    detector_name = ""
    
    def __init__(
        self,
        headless: bool = True,
        use_cookies: bool = True,
        cookies_dir: Optional[Path] = None,
        max_retries: int = DEFAULT_MAX_RETRIES,
    ):
        """
        Initialize the detector.
        
        Args:
            headless: Whether to run browser in headless mode
            use_cookies: Whether to load authentication cookies
            cookies_dir: Directory containing cookie files
            max_retries: Maximum number of retry attempts
        """
        self.headless = headless
        self.use_cookies = use_cookies
        self.cookies_dir = cookies_dir
        self.max_retries = max_retries
        self.browser = None
    
    async def __aenter__(self):
        """Start the browser with stealth arguments."""
        self.browser = await uc.start(
            headless=self.headless,
            browser_args=STEALTH_BROWSER_ARGS,
        )
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Clean up browser resources."""
        if self.browser:
            self.browser.stop()
    
    async def load_cookies(self, domain: str) -> None:
        """
        Load cookies for a domain using JavaScript injection.
        
        This method injects cookies via JavaScript to bypass cookie loading
        restrictions. It navigates to the domain first, then sets cookies
        using document.cookie.
        
        Args:
            domain: Domain to load cookies for
        """
        if not self.use_cookies:
            return
            
        cookies = load_cookies_for_domain(domain, self.cookies_dir)
        if not cookies:
            return
        
        cookies_json = json.dumps(cookies)
        
        js_code = f"""
        (function() {{
            let cookies = {cookies_json};

            function setCookie(key, value, domain, expirationDate, path, isSecure, sameSite) {{
                const currentHostname = window.location.hostname;
                domain = domain || currentHostname;

                if (domain !== currentHostname && !currentHostname.endsWith(domain)) {{
                    const hostnameParts = currentHostname.split('.');
                    if (hostnameParts.length > 2) {{
                        domain = '.' + hostnameParts.slice(-2).join('.');
                    }}
                }}
                let expires = "";
                if (expirationDate) {{
                    expires = new Date(expirationDate * 1000).toUTCString();
                    expires = 'expires=' + expires + ';';
                }}
                sameSite = sameSite ? 'SameSite=' + sameSite.charAt(0).toUpperCase() + sameSite.slice(1) : 'SameSite=Lax;';

                if (key.startsWith('__Host')) {{
                    document.cookie = key + '=' + value + ';' + expires + 'path=' + path + ';Secure;SameSite=' + sameSite;
                }} else if (key.startsWith('__Secure')) {{
                    document.cookie = key + '=' + value + ';' + expires + 'domain=' + domain + ';path=' + path + ';Secure;SameSite=' + sameSite;
                }} else {{
                    document.cookie = key + '=' + value + ';' + expires + 'domain=' + domain + ';path=' + path + ';Secure;' + sameSite;
                }}
            }}
            
            for (let cookie of cookies) {{
                try {{
                    setCookie(cookie.name, cookie.value, cookie.domain, cookie.expiration, cookie.path, cookie.flag, 'Lax');
                }} catch(e) {{}}
            }}
        }})();
        """
        
        try:
            tab = await self.browser.get(f"https://{domain}/")
            await asyncio.sleep(1)
            await tab.evaluate(js_code)
            await asyncio.sleep(0.5)
            cookie_check = await tab.evaluate("document.cookie")
            print(f"  Cookies set for {domain}: {len(cookie_check)} chars")
        except Exception as e:
            print(f"  Warning: JS cookie loading failed for {domain}: {e}")
    
    @with_retry(max_retries=DEFAULT_MAX_RETRIES, delays=RETRY_DELAYS)
    async def _wait_for_result(self, tab, timeout: int = 10000) -> str:
        """
        Wait for detection result using wait_for_selector instead of sleep.
        
        This method uses proper wait conditions to wait for results to appear,
        which is more reliable than arbitrary sleep delays. It waits for common
        result container elements to appear.
        
        Args:
            tab: The browser tab to wait in
            timeout: Maximum wait time in milliseconds
            
        Returns:
            The page content after results are loaded
        """
        # Try multiple selectors that might indicate results are ready
        result_selectors = [
            "[class*='result']",
            "[class*='score']",
            "[class*='percentage']",
            "textarea",  # Input might become disabled when results ready
        ]
        
        for selector in result_selectors:
            try:
                await tab.wait_for_selector(selector, timeout=5000)
            except Exception:
                continue
        
        # Additional wait for dynamic content
        await asyncio.sleep(2)
        
        return await tab.evaluate("document.body.innerText")
    
    async def detect(self, text: str) -> Dict[str, Any]:
        """
        Perform detection on the given text.
        
        Override this method in subclasses to implement specific detection logic.
        
        Args:
            text: Text to check for AI generation
            
        Returns:
            Dictionary with detection results
        """
        raise NotImplementedError
    
    def _check_login_required(self, text: str) -> Optional[str]:
        """
        Check if the page requires login/signup to view results.
        
        Args:
            text: Page text content
            
        Returns:
            Error message if login required, None otherwise
        """
        login_patterns = [
            r"sign\s*up",
            r"log\s*in",
            r"upgrade",
            r"get\s*started",
            r"create\s*account",
            r"subscribe",
        ]
        
        for pattern in login_patterns:
            if re.search(pattern, text, re.IGNORECASE):
                return "Login/signup required to view results"
        
        return None


class GPTZeroDetector(BaseDetector):
    """GPTZero.me detector with retry logic and proper wait conditions."""
    
    URL = "https://gptzero.me/"
    detector_name = "gptzero"
    
    @with_retry(max_retries=DEFAULT_MAX_RETRIES, delays=RETRY_DELAYS)
    async def detect(self, text: str) -> Dict[str, Any]:
        """
        Check text using GPTZero.
        
        Uses retry decorator with exponential backoff (2s, 4s, 8s delays).
        Waits for results using wait_for_selector instead of sleep.
        
        Args:
            text: Text to check for AI generation
            
        Returns:
            Dictionary with detection results including aiPercentage
        """
        try:
            await self.load_cookies("gptzero.me")
            
            tab = await self.browser.get(self.URL)
            await tab.wait_for_selector("textarea", timeout=10000)
            
            textarea = await tab.select("textarea")
            if not textarea:
                return {
                    "detector": "GPTZero",
                    "url": self.URL,
                    "success": False,
                    "error": "Textarea not found",
                }
            
            await textarea.send_keys(text)
            
            button = await tab.select("button")
            if button:
                await button.click()
            
            # Use wait_for_result instead of sleep for proper wait conditions
            page_text = await self._wait_for_result(tab)
            
            # Check for login requirement
            login_error = self._check_login_required(page_text)
            if login_error:
                return {
                    "detector": "GPTZero",
                    "url": self.URL,
                    "success": False,
                    "error": login_error,
                }
            
            # Extract and validate percentage
            ai_percent = extract_percentage(page_text)
            
            if ai_percent is None:
                return {
                    "detector": "GPTZero",
                    "url": self.URL,
                    "success": False,
                    "error": "Could not extract result - login may be required",
                }
            
            # Validate percentage is in valid range
            if not validate_percentage(ai_percent):
                return {
                    "detector": "GPTZero",
                    "url": self.URL,
                    "success": False,
                    "error": f"Invalid percentage extracted: {ai_percent}",
                }
            
            return {
                "detector": "GPTZero",
                "url": self.URL,
                "success": True,
                "results": {
                    "aiPercentage": ai_percent,
                    "humanPercentage": 100 - ai_percent,
                },
            }
        except Exception as e:
            return {
                "detector": "GPTZero",
                "url": self.URL,
                "success": False,
                "error": str(e),
            }


class ZeroGPTDetector(BaseDetector):
    """ZeroGPT detector with retry logic and proper wait conditions."""
    
    URL = "https://zerogpt.com/"
    detector_name = "zerogpt"
    
    @with_retry(max_retries=DEFAULT_MAX_RETRIES, delays=RETRY_DELAYS)
    async def detect(self, text: str) -> Dict[str, Any]:
        """
        Check text using ZeroGPT.
        
        Uses retry decorator with exponential backoff (2s, 4s, 8s delays).
        Waits for results using wait_for_selector instead of sleep.
        
        Args:
            text: Text to check for AI generation
            
        Returns:
            Dictionary with detection results including aiPercentage
        """
        try:
            await self.load_cookies("zerogpt.com")
            
            tab = await self.browser.get(self.URL)
            await tab.wait_for_selector("textarea, input[type='text']", timeout=10000)
            
            inp = await tab.select("textarea") or await tab.select("input[type='text']")
            if not inp:
                return {"success": False, "error": "Input not found"}
            
            await inp.send_keys(text)
            
            # Find detect button
            buttons = await tab.select_all("button")
            for btn in buttons:
                if btn.text and "detect" in btn.text.lower():
                    await btn.click()
                    break
            
            # Use wait_for_result instead of sleep for proper wait conditions
            page_text = await self._wait_for_result(tab)
            
            # Check for login requirement
            login_error = self._check_login_required(page_text)
            if login_error:
                return {
                    "detector": "ZeroGPT",
                    "url": self.URL,
                    "success": False,
                    "error": login_error,
                }
            
            # Extract and validate percentage
            ai_percent = extract_percentage(page_text)
            
            if ai_percent is None:
                return {
                    "detector": "ZeroGPT",
                    "url": self.URL,
                    "success": False,
                    "error": "Could not extract result - login may be required",
                }
            
            # Validate percentage is in valid range
            if not validate_percentage(ai_percent):
                return {
                    "detector": "ZeroGPT",
                    "url": self.URL,
                    "success": False,
                    "error": f"Invalid percentage extracted: {ai_percent}",
                }
            
            return {
                "detector": "ZeroGPT",
                "url": self.URL,
                "success": True,
                "results": {
                    "aiPercentage": ai_percent,
                    "humanPercentage": 100 - ai_percent if ai_percent else None,
                },
            }
        except Exception as e:
            return {"detector": "ZeroGPT", "success": False, "error": str(e)}


class WinstonDetector(BaseDetector):
    """Winston AI detector with retry logic and proper wait conditions."""
    
    URL = "https://gowinston.ai/"
    detector_name = "winston"
    
    @with_retry(max_retries=DEFAULT_MAX_RETRIES, delays=RETRY_DELAYS)
    async def detect(self, text: str) -> Dict[str, Any]:
        """
        Check text using Winston AI.
        
        Uses retry decorator with exponential backoff (2s, 4s, 8s delays).
        Waits for results using wait_for_selector instead of sleep.
        
        Args:
            text: Text to check for AI generation
            
        Returns:
            Dictionary with detection results including aiPercentage
        """
        try:
            await self.load_cookies("gowinston.ai")
            
            tab = await self.browser.get(self.URL)
            await tab.wait_for_selector("textarea", timeout=10000)
            
            textarea = await tab.select("textarea")
            if not textarea:
                page_text = await tab.evaluate("document.body.innerText")
                login_error = self._check_login_required(page_text)
                if login_error:
                    return {
                        "detector": "Winston AI",
                        "url": self.URL,
                        "success": False,
                        "error": "Sign-up required to view results",
                    }
                return {"success": False, "error": "Textarea not found"}
            
            await textarea.send_keys(text)
            
            # Find the scan button
            buttons = await tab.select_all("button")
            button = None
            for btn in buttons:
                if btn.text and "scan" in btn.text.lower():
                    button = btn
                    break
            if button:
                await button.click()
            
            # Use wait_for_result instead of sleep for proper wait conditions
            page_text = await self._wait_for_result(tab)
            
            # Check for login requirement
            login_error = self._check_login_required(page_text)
            if login_error:
                return {
                    "detector": "Winston AI",
                    "url": self.URL,
                    "success": False,
                    "error": login_error,
                }
            
            # Extract and validate percentage
            ai_percent = extract_percentage(page_text)
            
            if ai_percent is None:
                return {
                    "detector": "Winston AI",
                    "url": self.URL,
                    "success": False,
                    "error": "Could not extract AI percentage from results",
                }
            
            # Validate percentage is in valid range
            if not validate_percentage(ai_percent):
                return {
                    "detector": "Winston AI",
                    "url": self.URL,
                    "success": False,
                    "error": f"Invalid percentage extracted: {ai_percent}",
                }
            
            return {
                "detector": "Winston AI",
                "url": self.URL,
                "success": True,
                "results": {
                    "aiPercentage": ai_percent,
                    "humanPercentage": 100 - ai_percent,
                },
            }
        except Exception as e:
            return {"detector": "Winston AI", "success": False, "error": str(e)}


class OriginalityDetector(BaseDetector):
    """Originality.ai detector with retry logic and proper wait conditions."""
    
    URL = "https://originality.ai/"
    detector_name = "originality"
    
    @with_retry(max_retries=DEFAULT_MAX_RETRIES, delays=RETRY_DELAYS)
    async def detect(self, text: str) -> Dict[str, Any]:
        """
        Check text using Originality.ai.
        
        Uses retry decorator with exponential backoff (2s, 4s, 8s delays).
        Waits for results using wait_for_selector instead of sleep.
        
        Args:
            text: Text to check for AI generation
            
        Returns:
            Dictionary with detection results including aiPercentage
        """
        try:
            await self.load_cookies("originality.ai")
            
            tab = await self.browser.get(self.URL)
            await tab.wait_for_selector("textarea", timeout=10000)
            
            textarea = await tab.select("textarea")
            if not textarea:
                page_text = await tab.evaluate("document.body.innerText")
                login_error = self._check_login_required(page_text)
                if login_error:
                    return {
                        "detector": "Originality.ai",
                        "url": self.URL,
                        "success": False,
                        "error": "Login/signup required - no free access available",
                    }
                return {
                    "success": False,
                    "error": "Login/signup required - no free access available",
                }
            
            await textarea.send_keys(text)
            
            # Click scan button
            buttons = await tab.select_all("button")
            for btn in buttons:
                if btn.text and "scan" in btn.text.lower():
                    await btn.click()
                    break
            
            # Use wait_for_result instead of sleep for proper wait conditions
            page_text = await self._wait_for_result(tab)
            
            # Check for login requirement
            login_error = self._check_login_required(page_text)
            if login_error:
                return {
                    "detector": "Originality.ai",
                    "url": self.URL,
                    "success": False,
                    "error": login_error,
                }
            
            # Extract and validate percentage
            ai_percent = extract_percentage(page_text)
            
            if ai_percent is None:
                return {
                    "detector": "Originality.ai",
                    "url": self.URL,
                    "success": False,
                    "error": "Could not extract AI percentage from results",
                }
            
            # Validate percentage is in valid range
            if not validate_percentage(ai_percent):
                return {
                    "detector": "Originality.ai",
                    "url": self.URL,
                    "success": False,
                    "error": f"Invalid percentage extracted: {ai_percent}",
                }
            
            return {
                "detector": "Originality.ai",
                "url": self.URL,
                "success": True,
                "results": {
                    "aiPercentage": ai_percent,
                    "humanPercentage": 100 - ai_percent,
                },
            }
        except Exception as e:
            return {"detector": "Originality.ai", "success": False, "error": str(e)}


# =============================================================================
# DETECTOR REGISTRY
# =============================================================================

DETECTORS = {
    "gptzero": GPTZeroDetector,
    "zerogpt": ZeroGPTDetector,
    "winston": WinstonDetector,
    "originality": OriginalityDetector,
}


# =============================================================================
# MAIN DETECTION FUNCTION
# =============================================================================

async def run_detection(
    text: str,
    detector_names: Optional[List[str]] = None,
    headless: bool = True,
    use_cookies: bool = True,
    cookies_dir: Optional[Path] = None,
    max_retries: int = DEFAULT_MAX_RETRIES,
) -> Dict[str, Any]:
    """
    Run detection using specified detectors.
    
    Args:
        text: Text to check for AI generation
        detector_names: List of detector names to use (default: all)
        headless: Whether to run browser in headless mode
        use_cookies: Whether to load authentication cookies
        cookies_dir: Directory containing cookie files
        max_retries: Maximum retry attempts per detector
        
    Returns:
        Dictionary mapping detector names to their results
        
    Example:
        >>> results = await run_detection("Your text here", ["gptzero"])
        >>> print(results["gptzero"]["results"]["aiPercentage"])
    """
    results = {}
    
    detectors_to_use = detector_names if detector_names else list(DETECTORS.keys())
    
    for name in detectors_to_use:
        if name not in DETECTORS:
            results[name] = {
                "detector": name,
                "success": False,
                "error": "Unknown detector",
            }
            continue
        
        detector_class = DETECTORS[name]
        print(f"Testing with {name}...")
        
        async with detector_class(
            headless=headless,
            use_cookies=use_cookies,
            cookies_dir=cookies_dir,
            max_retries=max_retries,
        ) as detector:
            result = await detector.detect(text)
            results[name] = result
            
            if result.get("success"):
                ai_pct = result.get("results", {}).get("aiPercentage", "N/A")
                print(f"  ✓ {name} completed: {ai_pct}% AI")
            else:
                print(f"  ✗ {name} failed: {result.get('error')}")
    
    return results


# =============================================================================
# CLI INTERFACE
# =============================================================================

def main():
    """Main CLI entry point."""
    import argparse
    
    parser = argparse.ArgumentParser(
        description="AI Detection using nodriver with stealth browser automation",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  %(prog)s --text "Your text here" --detector gptzero
  %(prog)s --text "Your text here" --detector gptzero --retries 3
  %(prog)s --text "Your text here" --detector gptzero --cookies-dir ./cookies
  %(prog)s --text "Your text here" --detector gptzero zerogpt --headless

Supported detectors:
  gptzero     - GPTZero.me
  zerogpt     - ZeroGPT.com
  winston     - Winston AI
  originality - Originality.ai
        """
    )
    
    parser.add_argument(
        "--text", "-t",
        required=True,
        help="Text to check for AI generation"
    )
    
    parser.add_argument(
        "--detector", "-d",
        action="append",
        help="Detector(s) to use (can specify multiple)"
    )
    
    parser.add_argument(
        "--headless",
        action="store_true",
        default=True,
        help="Run browser in headless mode (default: True)"
    )
    
    parser.add_argument(
        "--visible",
        action="store_true",
        help="Show browser window (overrides --headless)"
    )
    
    parser.add_argument(
        "--cookies-dir",
        help="Path to directory containing cookie files (gptzero.txt, etc.)"
    )
    
    parser.add_argument(
        "--no-cookies",
        action="store_true",
        help="Run without authentication cookies (anonymous mode)"
    )
    
    parser.add_argument(
        "--retries",
        type=int,
        default=DEFAULT_MAX_RETRIES,
        help=f"Number of retry attempts (default: {DEFAULT_MAX_RETRIES})"
    )
    
    args = parser.parse_args()
    
    # Validate arguments
    if args.cookies_dir and args.no_cookies:
        print("Error: --cookies-dir and --no-cookies are mutually exclusive",
              file=sys.stderr)
        sys.exit(1)
    
    # Determine browser mode
    headless = not args.visible
    
    # Determine cookie settings
    use_cookies = not args.no_cookies
    cookies_path = Path(args.cookies_dir) if args.cookies_dir else None
    
    # Get detectors to use
    detectors = args.detector or list(DETECTORS.keys())
    
    print(f"Running detection on text ({len(args.text)} chars)...")
    print(f"Detectors: {', '.join(detectors)}")
    print(f"Headless: {headless}, Use cookies: {use_cookies}, Retries: {args.retries}")
    print("-" * 50)
    
    # Run detection
    results = asyncio.run(
        run_detection(
            text=args.text,
            detector_names=detectors,
            headless=headless,
            use_cookies=use_cookies,
            cookies_dir=cookies_path,
            max_retries=args.retries,
        )
    )
    
    # Print results
    print("\n" + "=" * 50)
    print("RESULTS:")
    print(json.dumps(results, indent=2))
    
    # Exit with error if all failed
    if not any(r.get("success", False) for r in results.values()):
        sys.exit(1)


if __name__ == "__main__":
    main()
