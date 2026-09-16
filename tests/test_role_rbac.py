import pytest
import io
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.services.qr_service import qr_service

@pytest.mark.anyio
async def test_public_admin_registration_forbidden():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.post("/api/v1/auth/register", json={
            "name": "Malicious Attacker",
            "email": "attacker@evil.com",
            "password": "Password@123",
            "role": "admin"
        })
        assert response.status_code in [403, 422]

@pytest.mark.anyio
async def test_citizen_cannot_access_admin_api():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # 1. Login as citizen
        login_res = await ac.post("/api/v1/auth/quick-login", json={"role": "citizen"})
        assert login_res.status_code == 200
        token = login_res.json()["access_token"]

        # 2. Attempt to access admin endpoint
        admin_res = await ac.get("/api/v1/admin/users", headers={"Authorization": f"Bearer {token}"})
        assert admin_res.status_code == 403
        assert "access denied" in admin_res.json()["detail"].lower()

@pytest.mark.anyio
async def test_citizen_cannot_access_organization_api():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # 1. Login as citizen
        login_res = await ac.post("/api/v1/auth/quick-login", json={"role": "citizen"})
        assert login_res.status_code == 200
        token = login_res.json()["access_token"]

        # 2. Attempt to access org endpoint
        org_res = await ac.get("/api/v1/org/dashboard-stats", headers={"Authorization": f"Bearer {token}"})
        assert org_res.status_code == 403

@pytest.mark.anyio
async def test_organization_cannot_access_admin_api():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # 1. Login as organization
        login_res = await ac.post("/api/v1/auth/quick-login", json={"role": "organization"})
        assert login_res.status_code == 200
        token = login_res.json()["access_token"]

        # 2. Attempt to access admin endpoint
        admin_res = await ac.get("/api/v1/admin/users", headers={"Authorization": f"Bearer {token}"})
        assert admin_res.status_code == 403

@pytest.mark.anyio
async def test_admin_has_secops_access():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # 1. Login as admin
        login_res = await ac.post("/api/v1/auth/quick-login", json={"role": "admin"})
        assert login_res.status_code == 200
        token = login_res.json()["access_token"]

        # 2. Access admin stats
        stats_res = await ac.get("/api/v1/admin/dashboard-stats", headers={"Authorization": f"Bearer {token}"})
        assert stats_res.status_code == 200
        data = stats_res.json()
        assert "total_users" in data
        assert "data_source" in data

@pytest.mark.anyio
async def test_citizen_dashboard_and_my_reports():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # 1. Login as citizen
        login_res = await ac.post("/api/v1/auth/quick-login", json={"role": "citizen"})
        assert login_res.status_code == 200
        token = login_res.json()["access_token"]

        # 2. Get citizen dashboard stats
        c_stats = await ac.get("/api/v1/citizen/dashboard-stats", headers={"Authorization": f"Bearer {token}"})
        assert c_stats.status_code == 200
        stats = c_stats.json()
        assert "safety_score" in stats
        assert "total_scans" in stats

        # 3. Get my reports
        my_rep = await ac.get("/api/v1/threats/my-reports", headers={"Authorization": f"Bearer {token}"})
        assert my_rep.status_code == 200
        assert isinstance(my_rep.json(), list)

def test_qr_decode_invalid_image():
    # Corrupt or non-barcode image should raise ValueError
    with pytest.raises(ValueError):
        qr_service.decode_qr_image(b"not an image bytes")
