import sys
import json
import browser_cookie3

def export_cookies(domain=".x.com", output_file="cookies.json"):
    cookies = []
    try:
        cookies = browser_cookie3.firefox(domain_name=domain)
    except Exception:
        try:
            cookies = browser_cookie3.chrome(domain_name=domain)
        except Exception:
            print("Error: Could not load cookies from Firefox or Chrome.")
            sys.exit(1)

    cookie_list = [
        {"name": c.name, "value": c.value, "domain": c.domain, "path": c.path}
        for c in cookies
    ]

    if not cookie_list:
        print("Error: No cookies found. Please login to X.com.")
        sys.exit(1)

    with open(output_file, "w") as f:
        json.dump(cookie_list, f, indent=2)
    
    print(f"Successfully exported {len(cookie_list)} cookies to {output_file}")

if __name__ == "__main__":
    export_cookies()