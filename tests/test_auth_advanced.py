import pytest
import time
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.database.init_db import init_db

@pytest.fixture(autouse=True)
async def setup_test_db():
    await init_db()

@pytest.mark.anyio
async def test_citizen_and_org_registration():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        ts = int(time.time() * 1000)
        # 1. Citizen registration
        citizen_res = await client.post("/api/v1/auth/register", json={
            "name": "Pooja Hegde",
            "email": f"pooja_{ts}@cyberraksha.in",
            "password": "Password123!",
            "role": "citizen",
            "language": "kn"
        })
        assert citizen_res.status_code == 200
        data = citizen_res.json()
        assert "access_token" in data
        assert "refresh_token" in data
        assert data["user"]["role"] == "citizen"
        assert data["user"]["name"] == "Pooja Hegde"

        # 2. Organization registration
        org_res = await client.post("/api/v1/auth/register", json={
            "name": "Kavitha Rao",
            "email": f"kavitha_{ts}@securebank.co.in",
            "password": "BankPassword123!",
            "role": "organization",
            "language": "en",
            "organization_name": f"SecureBank India {ts}",
            "verified_domain": "securebank.co.in"
        })
        assert org_res.status_code == 200
        org_data = org_res.json()
        assert org_data["user"]["role"] == "organization"
        assert org_data["user"]["organization_id"] is not None

        # 3. Prohibit public Admin registration
        admin_attempt = await client.post("/api/v1/auth/register", json={
            "name": "Hacker Impersonator",
            "email": f"fakeadmin_{ts}@cyberraksha.in",
            "password": "Password123!",
            "role": "admin"
        })
        assert admin_attempt.status_code == 422 or admin_attempt.status_code == 403

@pytest.mark.anyio
async def test_login_and_refresh_token_rotation():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        ts = int(time.time() * 1000)
        email = f"rohit_{ts}@test.in"
        reg = await client.post("/api/v1/auth/register", json={
            "name": "Rohit Kumar",
            "email": email,
            "password": "RohitPassword99!",
            "role": "citizen"
        })
        assert reg.status_code == 200

        # Login with correct password
        login_res = await client.post("/api/v1/auth/login", json={
            "email": email,
            "password": "RohitPassword99!"
        })
        assert login_res.status_code == 200
        tokens = login_res.json()
        access_tok = tokens["access_token"]
        refresh_tok = tokens["refresh_token"]

        # Check /sessions endpoint with access token
        sess_res = await client.get("/api/v1/auth/sessions", headers={"Authorization": f"Bearer {access_tok}"})
        assert sess_res.status_code == 200
        sessions = sess_res.json()
        assert len(sessions) >= 1

        # Refresh token rotation
        refresh_res = await client.post("/api/v1/auth/refresh", json={"refresh_token": refresh_tok})
        assert refresh_res.status_code == 200
        new_tokens = refresh_res.json()
        assert new_tokens["access_token"] != access_tok
        assert new_tokens["refresh_token"] != refresh_tok

        # Re-using old rotated refresh token MUST be rejected
        reuse_res = await client.post("/api/v1/auth/refresh", json={"refresh_token": refresh_tok})
        assert reuse_res.status_code == 401

@pytest.mark.anyio
async def test_password_change_and_forgot_reset_flow():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        ts = int(time.time() * 1000)
        email = f"priya_{ts}@test.in"
        reg_res = await client.post("/api/v1/auth/register", json={
            "name": "Priya Sen",
            "email": email,
            "password": "InitialPassword123!",
            "role": "citizen"
        })
        assert reg_res.status_code == 200
        access_tok = reg_res.json()["access_token"]

        # Change password
        chg_res = await client.post(
            "/api/v1/auth/change-password",
            json={"current_password": "InitialPassword123!", "new_password": "NewUpdatedPassword456!"},
            headers={"Authorization": f"Bearer {access_tok}"}
        )
        assert chg_res.status_code == 200

        # Login with new password succeeds
        login_new = await client.post("/api/v1/auth/login", json={
            "email": email,
            "password": "NewUpdatedPassword456!"
        })
        assert login_new.status_code == 200

        # Forgot password request
        forgot_res = await client.post("/api/v1/auth/forgot-password", json={"email": email})
        assert forgot_res.status_code == 200
        dev_token = forgot_res.json().get("dev_reset_token")
        assert dev_token is not None

        # Reset password with token
        reset_res = await client.post("/api/v1/auth/reset-password", json={
            "token": dev_token,
            "new_password": "FinalResetPassword789!"
        })
        assert reset_res.status_code == 200

        # Login with reset password
        login_reset = await client.post("/api/v1/auth/login", json={
            "email": email,
            "password": "FinalResetPassword789!"
        })
        assert login_reset.status_code == 200
