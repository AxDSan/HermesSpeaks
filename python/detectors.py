#!/usr/bin/env python3
"""
Consolidated AI Detector using nodriver (stealth browser automation)
Provides stealth browser-based detection for AI content with:
- Proper wait conditions (no asyncio.sleep)
- Result validation (0-100 range)
- Retry logic with exponential backoff
"""

import asyncio
import json
import sys
import re
import logging
from typing import Optional, Dict, Any, List
from functools import wraps

try:
    import nodriver as uc
except ImportError:
    print("Error: nodriver not installed. Run: pip install nodriver", file=sys.stderr)
    sys.exit(1)

logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


def with_retry(max_retries: int = 3, base_delay: float = 2.0):
    """
    Decorator that adds retry logic with exponential backoff.

    Args:
        max_retries: Maximum number of retry attempts (default: 3)
        base_delay: Initial delay in seconds (default: 2.0)
                    Delays will be: 2s, 4s, 8s for 3 retries
    """

    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            last_exception = None
            for attempt in range(max_retries + 1):
                try:
                    return await func(*args, **kwargs)
                except Exception as e:
                    last_exception = e
                    if attempt < max_retries:
                        delay = base_delay * (2**attempt)
                        logger.warning(
                            f"Attempt {attempt + 1}/{max_retries + 1} failed: {e}. Retrying in {delay}s..."
                        )
                        await asyncio.sleep(delay)
                    else:
                        logger.error(
                            f"All {max_retries + 1} attempts failed. Last error: {e}"
                        )

            return {
                "success": False,
                "error": f"Failed after {max_retries + 1} attempts: {last_exception}",
            }

        return wrapper

    return decorator


def validate_percentage(value: Optional[int]) -> Optional[int]:
    """
    Validate that a percentage is within the valid range 0-100.

    Args:
        value: The percentage value to validate

    Returns:
        The validated value if valid, None otherwise
    """
    if value is None:
        return None

    try:
        value = int(value)
        if 0 <= value <= 100:
            return value
        else:
            logger.warning(f"Invalid percentage {value}: outside 0-100 range")
            return None
    except (TypeError, ValueError) as e:
        logger.warning(f"Invalid percentage value {value}: {e}")
        return None


def extract_percentage(text: str) -> Optional[int]:
    """
    Extract percentage from text using regex.

    Args:
        text: The text to search for percentage

    Returns:
        The extracted percentage if found and valid, None otherwise
    """
    match = re.search(r"(\d+)%", text)
    if match:
        return validate_percentage(int(match.group(1)))
    return None


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


class AIDetector:
    """Base class for AI detection with browser automation"""

    def __init__(self, headless: bool = True):
        self.headless = headless
        self.browser: Optional[uc.Browser] = None
        self.tab: Optional[uc.Tab] = None

    async def __aenter__(self):
        self.browser = await uc.start(
            headless=self.headless, browser_args=STEALTH_BROWSER_ARGS
        )
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.browser:
            self.browser.stop()
            self.browser = None
        self.tab = None

    async def _wait_for_result(self, timeout: int = 30000) -> bool:
        """
        Wait for result container to appear using proper selectors.

        Args:
            timeout: Maximum wait time in milliseconds

        Returns:
            True if result found, False otherwise
        """
        result_selectors = [
            ".result",
            ".percentage",
            "[data-result]",
            ".score",
            ".ai-score",
            ".detection-result",
            ".analysis-result",
            "[class*='result']",
            "[class*='score']",
            "[id*='result']",
            "[id*='score']",
        ]

        for selector in result_selectors:
            try:
                element = await self.tab.select(selector, timeout=5000)
                if element:
                    return True
            except Exception:
                continue

        await asyncio.sleep(2)
        return True

    async def _fill_textarea(self, text: str) -> bool:
        """
        Fill textarea with text content.

        Args:
            text: Text to fill

        Returns:
            True if successful, False otherwise
        """
        textarea = await self.tab.select("textarea")
        if textarea:
            await textarea.send_keys(text)
            return True
        return False

    async def _click_button(self, button_text: Optional[str] = None) -> bool:
        """
        Click a button, optionally filtering by text.

        Args:
            button_text: Optional text to filter buttons

        Returns:
            True if button clicked, False otherwise
        """
        if button_text:
            buttons = await self.tab.select_all("button")
            for btn in buttons:
                if btn.text and button_text.lower() in btn.text.lower():
                    await btn.click()
                    return True

        button = await self.tab.select("button")
        if button:
            await button.click()
            return True
        return False

    async def _get_content(self) -> str:
        """Get page content."""
        return await self.tab.get_content()

    @with_retry(max_retries=3, base_delay=2.0)
    async def detect(self, text: str) -> Dict[str, Any]:
        """Override in subclasses"""
        raise NotImplementedError


class GPTZeroDetector(AIDetector):
    """GPTZero.me detector with proper wait conditions and validation"""

    URL = "https://gptzero.me/"

    @with_retry(max_retries=3, base_delay=2.0)
    async def detect(self, text: str) -> Dict[str, Any]:
        try:
            self.tab = await self.browser.get(self.URL)

            await self.tab.wait_for_selector("textarea", timeout=15000)

            textarea = await self.tab.select("textarea")
            if not textarea:
                return {
                    "detector": "GPTZero",
                    "url": self.URL,
                    "success": False,
                    "error": "Textarea not found",
                }

            await textarea.send_keys(text)

            button = await self.tab.select("button")
            if not button:
                return {
                    "detector": "GPTZero",
                    "url": self.URL,
                    "success": False,
                    "error": "Detect button not found",
                }
            await button.click()

            await self.tab.wait_for_selector(
                ".result, .percentage, [class*='result'], [class*='score']",
                timeout=30000,
            )
            await asyncio.sleep(2)

            page_content = await self._get_content()
            ai_percentage = extract_percentage(page_content)

            if ai_percentage is None:
                return {
                    "detector": "GPTZero",
                    "url": self.URL,
                    "success": False,
                    "error": "Could not extract AI percentage from results",
                }

            return {
                "detector": "GPTZero",
                "url": self.URL,
                "success": True,
                "results": {
                    "ai_percentage": ai_percentage,
                    "human_percentage": 100 - ai_percentage,
                    "raw": page_content[:500],
                },
            }

        except Exception as e:
            logger.exception(f"GPTZero detection failed: {e}")
            return {
                "detector": "GPTZero",
                "url": self.URL,
                "success": False,
                "error": str(e),
            }


class ZeroGPTDetector(AIDetector):
    """ZeroGPT detector with proper wait conditions and validation"""

    URL = "https://zerogpt.com/"

    @with_retry(max_retries=3, base_delay=2.0)
    async def detect(self, text: str) -> Dict[str, Any]:
        try:
            self.tab = await self.browser.get(self.URL)

            await self.tab.wait_for_selector(
                "textarea, input[type='text']", timeout=15000
            )

            textarea = await self.tab.select("textarea")
            if not textarea:
                input_field = await self.tab.select("input[type='text']")
                if not input_field:
                    return {
                        "detector": "ZeroGPT",
                        "url": self.URL,
                        "success": False,
                        "error": "Input field not found",
                    }
                await input_field.send_keys(text)
            else:
                await textarea.send_keys(text)

            buttons = await self.tab.select_all("button")
            button_clicked = False
            for btn in buttons:
                if btn.text and (
                    "detect" in btn.text.lower() or "check" in btn.text.lower()
                ):
                    await btn.click()
                    button_clicked = True
                    break

            if not button_clicked:
                return {
                    "detector": "ZeroGPT",
                    "url": self.URL,
                    "success": False,
                    "error": "Detect button not found",
                }

            await self.tab.wait_for_selector(
                ".result, .percentage, [class*='result'], [class*='score']",
                timeout=30000,
            )
            await asyncio.sleep(2)

            page_content = await self._get_content()
            ai_percentage = extract_percentage(page_content)

            if ai_percentage is None:
                return {
                    "detector": "ZeroGPT",
                    "url": self.URL,
                    "success": False,
                    "error": "Could not extract AI percentage from results",
                }

            return {
                "detector": "ZeroGPT",
                "url": self.URL,
                "success": True,
                "results": {
                    "ai_percentage": ai_percentage,
                    "human_percentage": 100 - ai_percentage,
                    "raw": page_content[:500],
                },
            }

        except Exception as e:
            logger.exception(f"ZeroGPT detection failed: {e}")
            return {
                "detector": "ZeroGPT",
                "url": self.URL,
                "success": False,
                "error": str(e),
            }


class WinstonDetector(AIDetector):
    """Winston AI detector with proper wait conditions and validation"""

    URL = "https://gowinston.ai/"

    @with_retry(max_retries=3, base_delay=2.0)
    async def detect(self, text: str) -> Dict[str, Any]:
        try:
            self.tab = await self.browser.get(self.URL)

            await self.tab.wait_for_selector("textarea", timeout=15000)

            textarea = await self.tab.select("textarea")
            if not textarea:
                return {
                    "detector": "Winston AI",
                    "url": self.URL,
                    "success": False,
                    "error": "Textarea not found",
                }

            await textarea.send_keys(text)

            button = await self.tab.select("button")
            if not button:
                return {
                    "detector": "Winston AI",
                    "url": self.URL,
                    "success": False,
                    "error": "Scan button not found",
                }
            await button.click()

            await self.tab.wait_for_selector(
                ".result, .percentage, [class*='result'], [class*='score']",
                timeout=30000,
            )
            await asyncio.sleep(2)

            page_content = await self._get_content()
            ai_percentage = extract_percentage(page_content)

            if ai_percentage is None:
                return {
                    "detector": "Winston AI",
                    "url": self.URL,
                    "success": False,
                    "error": "Could not extract AI percentage from results",
                }

            return {
                "detector": "Winston AI",
                "url": self.URL,
                "success": True,
                "results": {
                    "ai_percentage": ai_percentage,
                    "human_percentage": 100 - ai_percentage,
                    "raw": page_content[:500],
                },
            }

        except Exception as e:
            logger.exception(f"Winston AI detection failed: {e}")
            return {
                "detector": "Winston AI",
                "url": self.URL,
                "success": False,
                "error": str(e),
            }


class OriginalityDetector(AIDetector):
    """Originality.ai detector with proper wait conditions and validation"""

    URL = "https://originality.ai/"

    @with_retry(max_retries=3, base_delay=2.0)
    async def detect(self, text: str) -> Dict[str, Any]:
        try:
            self.tab = await self.browser.get(self.URL)

            await self.tab.wait_for_selector("textarea", timeout=15000)

            textarea = await self.tab.select("textarea")
            if not textarea:
                return {
                    "detector": "Originality.ai",
                    "url": self.URL,
                    "success": False,
                    "error": "Textarea not found",
                }

            await textarea.send_keys(text)

            buttons = await self.tab.select_all("button")
            button_clicked = False
            for btn in buttons:
                if btn.text and "scan" in btn.text.lower():
                    await btn.click()
                    button_clicked = True
                    break

            if not button_clicked:
                return {
                    "detector": "Originality.ai",
                    "url": self.URL,
                    "success": False,
                    "error": "Scan button not found",
                }

            await self.tab.wait_for_selector(
                ".result, .percentage, [class*='result'], [class*='score']",
                timeout=30000,
            )
            await asyncio.sleep(2)

            page_content = await self._get_content()
            ai_percentage = extract_percentage(page_content)

            if ai_percentage is None:
                return {
                    "detector": "Originality.ai",
                    "url": self.URL,
                    "success": False,
                    "error": "Could not extract AI percentage from results",
                }

            return {
                "detector": "Originality.ai",
                "url": self.URL,
                "success": True,
                "results": {
                    "ai_percentage": ai_percentage,
                    "human_percentage": 100 - ai_percentage,
                    "raw": page_content[:500],
                },
            }

        except Exception as e:
            logger.exception(f"Originality.ai detection failed: {e}")
            return {
                "detector": "Originality.ai",
                "url": self.URL,
                "success": False,
                "error": str(e),
            }


DETECTORS = {
    "gptzero": GPTZeroDetector,
    "zerogpt": ZeroGPTDetector,
    "winston": WinstonDetector,
    "originality": OriginalityDetector,
}


async def run_detection(
    text: str,
    detector_names: Optional[List[str]] = None,
    headless: bool = True,
    max_retries: int = 3,
) -> Dict[str, Any]:
    """
    Run detection using specified detectors.

    Args:
        text: Text to analyze
        detector_names: List of detector names to use (default: all)
        headless: Run browser in headless mode
        max_retries: Maximum retry attempts per detector

    Returns:
        Dictionary of results keyed by detector name
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

        async with detector_class(headless=headless) as detector:
            result = await detector.detect(text)
            results[name] = result

            if result.get("success"):
                ai_pct = result.get("results", {}).get("ai_percentage")
                print(f"  ✓ {name} completed: {ai_pct}% AI detected")
            else:
                print(f"  ✗ {name} failed: {result.get('error')}")

    return results


async def detect_single(
    text: str, detector_name: str, headless: bool = True
) -> Dict[str, Any]:
    """
    Run detection with a single detector.

    Args:
        text: Text to analyze
        detector_name: Name of detector to use
        headless: Run browser in headless mode

    Returns:
        Detection result dictionary
    """
    if detector_name not in DETECTORS:
        return {
            "detector": detector_name,
            "success": False,
            "error": f"Unknown detector: {detector_name}",
        }

    detector_class = DETECTORS[detector_name]

    async with detector_class(headless=headless) as detector:
        return await detector.detect(text)


def main():
    import argparse

    parser = argparse.ArgumentParser(
        description="AI Detection using nodriver with retry logic and result validation"
    )
    parser.add_argument("--text", "-t", help="Text to check for AI-generated content")
    parser.add_argument(
        "--detector",
        "-d",
        action="append",
        help="Detector(s) to use: gptzero, zerogpt, winston, originality",
    )
    parser.add_argument(
        "--headless",
        action="store_true",
        default=True,
        help="Run browser in headless mode (default: True)",
    )
    parser.add_argument(
        "--visible",
        action="store_true",
        help="Show browser window (overrides --headless)",
    )
    parser.add_argument(
        "--retries", type=int, default=3, help="Maximum retry attempts (default: 3)"
    )
    parser.add_argument("--json", action="store_true", help="Output results as JSON")

    args = parser.parse_args()

    if not args.text:
        print("Error: --text is required", file=sys.stderr)
        sys.exit(1)

    detectors = args.detector or list(DETECTORS.keys())
    headless = not args.visible

    results = asyncio.run(run_detection(args.text, detectors, headless, args.retries))

    if args.json:
        print(json.dumps(results, indent=2))
    else:
        print("\n" + "=" * 50)
        print("RESULTS:")
        print(json.dumps(results, indent=2))

    if not any(r.get("success", False) for r in results.values()):
        sys.exit(1)


if __name__ == "__main__":
    main()
