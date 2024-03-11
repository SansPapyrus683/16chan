import os

print("Welcome to 16chan!")
print("Before we get started, I'm gonna need you to input some environment variables:")

env_vars = {
    "DB_URL": None,
    "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY": None,
    "CLERK_SECRET_KEY": None,
    "WEBHOOK_SECRET": None,
    "AWS_ACCESS_KEY_ID": None,
    "AWS_SECRET_ACCESS_KEY": None,
    "AWS_REGION": None,
    "AWS_BUCKET_RAW": None,
    "AWS_BUCKET_MINI": None,
    "RAW_CDN": None,
    "MINI_CDN": None,
    "NEXT_PUBLIC_PAGE_SIZE": "40"
}

with open(".env", "w") as written:
    for var, val in env_vars.items():
        if val is None:
            env_vars[var] = input(f"{var}: ")
        print(f"{var}=\"{env_vars[var]}\"", file=written)

print("Alright, it's time to start!")
os.system("npm run dev")
