#!/usr/bin/env python3
"""
AI Detector using stealth-browser-mcp (nodriver + FastMCP)

This integrates with the existing stealth-browser-mcp package.
"""

import asyncio
import json
import sys
import os
import re
from pathlib import Path
from typing import Dict, Any, Optional


try:
    import nodriver as uc
    from nodriver.cdp.network import CookieParam
except ImportError:
    print("Error: nodriver not installed", file=sys.stderr)
    sys.exit(1)


def parse_netscape_cookies(filepath: str) -> list:
    """Parse a Netscape-format cookie file"""
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
                except:
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


def load_cookies_for_domain(domain: str) -> list:
    """Load cookies from the cookie file for a given domain"""
    cookie_dir = Path(__file__).parent.parent

    cookie_files = {
        "gptzero.me": "gptzero.txt",
        "gowinston.ai": "winston.txt",
        "originality.ai": "originality.txt",
        "zerogpt.com": "zerogpt.txt",
    }

    for domain_key, filename in cookie_files.items():
        if domain_key in domain:
            cookie_path = cookie_dir / filename
            if cookie_path.exists():
                return parse_netscape_cookies(str(cookie_path))
            break

    return []


class StealthAIDetector:
    """AI detector using stealth browser automation"""

    def __init__(
        self,
        headless: bool = True,
        cookies_dir: Optional[Path] = None,
        use_cookies: bool = True,
    ):
        self.headless = headless
        self.browser = None
        self.cookies_dir = cookies_dir
        self.use_cookies = use_cookies
        self.detector_name = ""

    async def __aenter__(self):
        self.browser = await uc.start(
            headless=self.headless,
            browser_args=[
                "--disable-blink-features=AutomationControlled",
                "--no-sandbox",
                "--disable-dev-shm-usage",
                "--disable-gpu",
                "--disable-blink-features=AdsHIghlightFPS",
                "--disable-infobars",
            ],
        )
        return self

        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.browser:
            self.browser.stop()

    async def load_cookies(self, domain: str, tab=None):
        """Load cookies for a domain using JavaScript injection"""
        cookies = load_cookies_for_domain(domain)
        if not cookies:
            return

        # Convert cookies to JSON format for JS
        cookies_json = json.dumps(cookies)

        # JavaScript to set cookies
        js_code = f"""
        (function() {{
            let cookies = {cookies_json};
            for (let cookie of cookies) {{
                try {{
                    let domain = cookie.domain;
                    if (domain.startsWith('.')) domain = domain.substring(1);
                    let exp = cookie.expiration;
                    let expires = exp > 0 ? new Date(exp * 1000).toUTCString() : '';
                    let sameSite = 'Lax';
                    let secure = cookie.flag ? 'Secure;' : '';
                    document.cookie = cookie.name + '=' + cookie.value + ';domain=' + domain + ';path=' + cookie.path + (expires ? ';expires=' + expires : '') + ';' + secure + 'SameSite=' + sameSite;
                }} catch(e) {{}}
            }}
        }})();
        """

        try:
            # Use provided tab or get existing tab
            target = tab
            if not target:
                tabs = await self.browser.get("about:blank")
                target = tabs
            await target.evaluate(js_code)
        except Exception:
            pass

    async def detect_gptzero(self, text: str) -> Dict[str, Any]:
        """Check text using GPTZero"""
        self.detector_name = "gptzero"
        try:
            tab = await self.browser.get("https://gptzero.me/")
            await asyncio.sleep(2)

            await self.load_cookies("gptzero.me", tab)

            textarea = await tab.select("textarea")
            if not textarea:
                return {"success": False, "error": "Textarea not found"}

            await textarea.send_keys(text)

            button = await tab.select("button")
            if button:
                await button.click()

            await asyncio.sleep(4)

            body_text = await tab.evaluate("document.body.innerText")

            result_patterns = [
                r"(\d+)%\s*AI",
                r"AI[:\s]+(\d+)%",
                r"completely\s+(\d+)%\s*AI",
                r"likely\s+(\d+)%\s*AI",
            ]
            ai_percent = None
            for pattern in result_patterns:
                match = re.search(pattern, body_text, re.IGNORECASE)
                if match:
                    ai_percent = int(match.group(1))
                    break

            if ai_percent is not None:
                return {
                    "detector": "GPTZero",
                    "url": "https://gptzero.me/",
                    "success": True,
                    "results": {
                        "aiPercentage": ai_percent,
                        "humanPercentage": 100 - ai_percent,
                    },
                }

            login_patterns = [
                r"sign\s*up\s*free\s*(?:to|for)",
                r"login\s*(?:to|for)\s*(?:see|view|get)",
                r"sign\s*up\s*(?:to|for)\s*(?:see|view|get)\s*result",
                r"create\s*account\s*(?:to|for)\s*(?:see|view|get)",
                r"upgrade\s*(?:to|for)\s*(?:see|view|get)\s*result",
            ]
            for pattern in login_patterns:
                if re.search(pattern, body_text, re.IGNORECASE):
                    return {
                        "detector": "GPTZero",
                        "url": "https://gptzero.me/",
                        "success": False,
                        "error": "Login/signup required to view results",
                    }

            return {
                "detector": "GPTZero",
                "url": "https://gptzero.me/",
                "success": False,
                "error": "Could not extract result - login may be required",
            }
        except Exception as e:
            return {"detector": "GPTZero", "success": False, "error": str(e)}

    async def detect_zerogpt(self, text: str) -> Dict[str, Any]:
        """Check text using ZeroGPT"""
        self.detector_name = "zerogpt"
        try:
            tab = await self.browser.get("https://zerogpt.com/")
            await asyncio.sleep(2)

            await self.load_cookies("zerogpt.com", tab)

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

            await asyncio.sleep(8)

            body_text = await tab.evaluate("document.body.innerText")

            match = re.search(r"Your Text is.*?(\d+)%\s*AI\s*GPT", body_text, re.DOTALL)

            ai_percent = int(match.group(1)) if match else None

            return {
                "detector": "ZeroGPT",
                "url": "https://zerogpt.com/",
                "success": True,
                "results": {
                    "aiPercentage": ai_percent,
                    "humanPercentage": 100 - ai_percent if ai_percent else None,
                },
            }
        except Exception as e:
            return {"detector": "ZeroGPT", "success": False, "error": str(e)}

    async def detect_winston(self, text: str) -> Dict[str, Any]:
        """Check text using Winston AI"""
        self.detector_name = "winston"
        try:
            tab = await self.browser.get("https://gowinston.ai/")
            await asyncio.sleep(2)

            await self.load_cookies("gowinston.ai", tab)

            textarea = await tab.select("textarea")
            if not textarea:
                body_text = await tab.evaluate("document.body.innerText")
                signup_patterns = [
                    r"sign\s*up",
                    r"get\s*started",
                    r"create\s*account",
                    r"subscribe",
                ]
                for pattern in signup_patterns:
                    if re.search(pattern, body_text, re.IGNORECASE):
                        return {
                            "detector": "Winston AI",
                            "url": "https://gowinston.ai/",
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

            await asyncio.sleep(4)

            body_text = await tab.evaluate("document.body.innerText")

            signup_patterns = [
                r"sign\s*up",
                r"get\s*started",
                r"create\s*account",
                r"subscribe",
            ]
            has_signup = False
            for pattern in signup_patterns:
                if re.search(pattern, body_text, re.IGNORECASE):
                    has_signup = True
                    break

            result_patterns = [
                r"(\d+)%\s*AI",
                r"AI[:\s]+(\d+)%",
                r"(\d+)%\s*probability",
            ]
            ai_percent = None
            for pattern in result_patterns:
                match = re.search(pattern, body_text, re.IGNORECASE)
                if match:
                    ai_percent = int(match.group(1))
                    break

            if has_signup and ai_percent is None:
                return {
                    "detector": "Winston AI",
                    "url": "https://gowinston.ai/",
                    "success": False,
                    "error": "Sign-up required to view results",
                }

            if ai_percent is None:
                return {
                    "detector": "Winston AI",
                    "url": "https://gowinston.ai/",
                    "success": False,
                    "error": "Could not extract AI percentage from results",
                }

            return {
                "detector": "Winston AI",
                "url": "https://gowinston.ai/",
                "success": True,
                "results": {
                    "aiPercentage": ai_percent,
                    "humanPercentage": 100 - ai_percent if ai_percent else None,
                },
            }
        except Exception as e:
            return {"detector": "Winston AI", "success": False, "error": str(e)}

    async def detect_originality(self, text: str) -> Dict[str, Any]:
        """Check text using Originality.ai"""
        self.detector_name = "originality"
        try:
            tab = await self.browser.get("https://originality.ai/")
            await asyncio.sleep(2)

            await self.load_cookies("originality.ai", tab)

            textarea = await tab.select("textarea")
            if not textarea:
                body_text = await tab.evaluate("document.body.innerText")
                login_patterns = [
                    r"log\s*in",
                    r"sign\s*up",
                    r"get\s*started",
                ]
                for pattern in login_patterns:
                    if re.search(pattern, body_text, re.IGNORECASE):
                        return {
                            "detector": "Originality.ai",
                            "url": "https://originality.ai/",
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

            await asyncio.sleep(5)

            body_text = await tab.evaluate("document.body.innerText")

            login_patterns = [
                r"log\s*in",
                r"sign\s*up",
                r"get\s*started",
            ]
            for pattern in login_patterns:
                if re.search(pattern, body_text, re.IGNORECASE):
                    return {
                        "detector": "Originality.ai",
                        "url": "https://originality.ai/",
                        "success": False,
                        "error": "Login/signup required - no free access available",
                    }

            match = re.search(r"(\d+)%", body_text)

            ai_percent = int(match.group(1)) if match else None

            return {
                "detector": "Originality.ai",
                "url": "https://originality.ai/",
                "success": True,
                "results": {
                    "aiPercentage": ai_percent,
                    "humanPercentage": 100 - ai_percent if ai_percent else None,
                },
            }
        except Exception as e:
            return {"detector": "Originality.ai", "success": False, "error": str(e)}


async def run_detection(
    text: str,
    detectors: list,
    headless: bool = True,
    cookies_dir: Optional[str] = None,
    use_cookies: bool = True,
) -> dict:
    """Run detection using specified detectors"""
    results = {}

    cookies_path = Path(cookies_dir) if cookies_dir else None

    async with StealthAIDetector(
        headless=headless, cookies_dir=cookies_path, use_cookies=use_cookies
    ) as detector:
        for name in detectors:
            print(f"Testing with {name}...")

            if name == "gptzero":
                result = await detector.detect_gptzero(text)
            elif name == "zerogpt":
                result = await detector.detect_zerogpt(text)
            elif name == "winston":
                result = await detector.detect_winston(text)
            elif name == "originality":
                result = await detector.detect_originality(text)
            else:
                result = {
                    "detector": name,
                    "success": False,
                    "error": "Unknown detector",
                }

            results[name] = result

            if result.get("success"):
                print(
                    f"  ✓ {name} completed: {result.get('results', {}).get('aiPercentage')}% AI"
                )
            else:
                print(f"  ✗ {name} failed: {result.get('error')}")

    return results


def main():
    import argparse

    parser = argparse.ArgumentParser(
        description="AI Detection using stealth-browser-mcp"
    )
    parser.add_argument("--text", "-t", required=True, help="Text to check")
    parser.add_argument(
        "--detector",
        "-d",
        action="append",
        help="Detector(s): gptzero, zerogpt, winston, originality",
    )
    parser.add_argument("--headless", action="store_true", default=True)
    parser.add_argument("--visible", action="store_true", help="Show browser")
    parser.add_argument(
        "--cookies-dir",
        help="Optional path to directory containing cookie files",
    )
    parser.add_argument(
        "--no-cookies",
        action="store_true",
        help="Run without authentication cookies (anonymous mode)",
    )

    args = parser.parse_args()

    if args.cookies_dir and args.no_cookies:
        print(
            "Error: --cookies-dir and --no-cookies are mutually exclusive",
            file=sys.stderr,
        )
        sys.exit(1)

    detectors = args.detector or ["gptzero"]
    headless = not args.visible
    use_cookies = not args.no_cookies

    results = asyncio.run(
        run_detection(
            args.text,
            detectors,
            headless,
            cookies_dir=args.cookies_dir,
            use_cookies=use_cookies,
        )
    )

    print("\n" + "=" * 50)
    print("RESULTS:")
    print(json.dumps(results, indent=2))


if __name__ == "__main__":
    main()
