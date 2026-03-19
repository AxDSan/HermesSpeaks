#!/usr/bin/env python3
"""Cookie management module for AI detectors.

Provides secure cookie loading, validation, and conversion for nodriver.
"""
import os
import stat
import time
from dataclasses import dataclass, field
from pathlib import Path
from typing import Dict, List, Optional


@dataclass
class CookieConfig:
    """Configuration for cookie loading for a specific detector."""
    
    domain: str
    cookie_file: str
    required_cookies: List[str] = field(default_factory=list)
    
    @classmethod
    def gptzero(cls) -> "CookieConfig":
        """Factory method for GPTZero detector configuration."""
        return cls(
            domain="gptzero.me",
            cookie_file="gptzero.txt",
            required_cookies=["accessToken4", "AMP_8f1ede8e9c"]
        )
    
    @classmethod
    def zerogpt(cls) -> "CookieConfig":
        """Factory method for ZeroGPT detector configuration."""
        return cls(
            domain="zerogpt.com",
            cookie_file="zerogpt.txt",
            required_cookies=["access_token", "isLoggedIn"]
        )


class CookieLoader:
    """Cookie loader for AI detectors with security validation.
    
    Provides methods to load, validate, and convert cookies for use with nodriver.
    """
    
    DETECTOR_CONFIGS: Dict[str, CookieConfig] = {
        "gptzero": CookieConfig.gptzero(),
        "zerogpt": CookieConfig.zerogpt(),
    }
    
    def __init__(self, cookies_dir: Optional[Path] = None):
        """Initialize the cookie loader.
        
        Args:
            cookies_dir: Directory containing cookie files. Defaults to project root.
        """
        if cookies_dir is None:
            self.cookies_dir = Path(__file__).parent.parent
        else:
            self.cookies_dir = Path(cookies_dir)
    
    def parse_netscape_cookies(self, filepath: Path) -> List[Dict]:
        """Parse cookies from a Netscape-format cookie file.
        
        Args:
            filepath: Path to the Netscape-format cookie file.
            
        Returns:
            List of cookie dictionaries with keys: name, value, domain, 
            path, secure, expiration, httpOnly.
            
        Raises:
            FileNotFoundError: If the cookie file does not exist.
            PermissionError: If the file has insecure permissions.
            ValueError: If the file format is invalid.
        """
        if not filepath.exists():
            raise FileNotFoundError(f"Cookie file not found: {filepath}")
        
        self._validate_file_permissions(filepath)
        
        cookies = []
        with open(filepath, "r") as f:
            for line_num, line in enumerate(f, 1):
                line = line.strip()
                if not line or line.startswith("#"):
                    continue
                
                parts = line.split("\t")
                if len(parts) < 7:
                    raise ValueError(f"Invalid cookie format at line {line_num}")
                
                cookie = {
                    "domain": parts[0],
                    "flag": parts[1] == "TRUE",
                    "path": parts[2],
                    "secure": parts[3] == "TRUE",
                    "expiration": int(parts[4]) if parts[4].isdigit() else 0,
                    "name": parts[5],
                    "value": parts[6],
                }
                cookies.append(cookie)
        
        return cookies
    
    def _validate_file_permissions(self, filepath: Path) -> None:
        """Validate that a file has secure permissions (600 or stricter).
        
        Args:
            filepath: Path to the file to validate.
            
        Raises:
            PermissionError: If the file has insecure permissions.
        """
        file_stat = filepath.stat()
        mode = file_stat.st_mode
        
        if mode & (stat.S_IRGRP | stat.S_IROTH | stat.S_IWGRP | stat.S_IWOTH):
            raise PermissionError(
                f"Insecure file permissions on {filepath}. "
                f"Expected 600 or stricter, got {oct(mode)[-3:]}"
            )
    
    def validate_cookies(self, cookies: List[Dict], config: CookieConfig) -> bool:
        """Validate that all required cookies are present.
        
        Args:
            cookies: List of cookie dictionaries.
            config: CookieConfig specifying required cookies.
            
        Returns:
            True if all required cookies are present.
        """
        cookie_names = {cookie["name"] for cookie in cookies}
        required = set(config.required_cookies)
        missing = required - cookie_names
        
        if missing:
            print(f"Warning: Missing required cookies: {missing}")
            return False
        
        return True
    
    def check_expiration(self, cookies: List[Dict]) -> Dict[str, bool]:
        """Check if cookies are expired.
        
        Args:
            cookies: List of cookie dictionaries.
            
        Returns:
            Dictionary mapping cookie names to expiration status (True = expired).
        """
        current_time = int(time.time())
        
        expiration_status = {}
        for cookie in cookies:
            expiration = cookie.get("expiration", 0)
            is_expired = expiration > 0 and expiration < current_time
            expiration_status[cookie["name"]] = is_expired
            
            if is_expired:
                print(f"Warning: Cookie expired: {cookie["name"]}")
        
        return expiration_status
    
    def load_for_detector(self, detector: str) -> List[Dict]:
        """Load and validate cookies for a specific detector.
        
        Args:
            detector: Name of the detector ("gptzero" or "zerogpt").
            
        Returns:
            List of valid, non-expired cookies for the detector.
            
        Raises:
            ValueError: If detector is not supported.
            FileNotFoundError: If cookie file does not exist.
        """
        if detector not in self.DETECTOR_CONFIGS:
            raise ValueError(f"Unknown detector: {detector}. Supported: {list(self.DETECTOR_CONFIGS.keys())}")
        
        config = self.DETECTOR_CONFIGS[detector]
        cookie_path = self.cookies_dir / config.cookie_file
        
        cookies = self.parse_netscape_cookies(cookie_path)
        
        if not self.validate_cookies(cookies, config):
            raise ValueError(f"Required cookies missing for {detector}")
        
        expiration_status = self.check_expiration(cookies)
        valid_cookies = [
            cookie for cookie in cookies 
            if not expiration_status.get(cookie["name"], False)
        ]
        
        return valid_cookies
    
    def get_nodriver_cookies(self, cookies: List[Dict]) -> List[Dict]:
        """Convert cookies to nodriver format.
        
        Args:
            cookies: List of cookie dictionaries in Netscape format.
            
        Returns:
            List of cookies in nodriver format with keys:
            name, value, domain, path, secure, httpOnly, sameSite.
        """
        nodriver_cookies = []
        
        for cookie in cookies:
            nodriver_cookie = {
                "name": cookie["name"],
                "value": cookie["value"],
                "domain": cookie["domain"],
                "path": cookie.get("path", "/"),
                "secure": cookie.get("secure", False),
                "httpOnly": False,
                "sameSite": "lax" if cookie.get("flag", True) else "none",
            }
            nodriver_cookies.append(nodriver_cookie)
        
        return nodriver_cookies
