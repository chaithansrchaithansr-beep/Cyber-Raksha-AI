import pytest
from httpx import ASGITransport, AsyncClient
from app.main import app
from app.database.init_db import init_db

@pytest.fixture(autouse=True)
async def setup_test_db():
    await init_db()

@pytest.mark.anyio
async def test_root_endpoint():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["platform"] == "CYBER RAKSHA AI"
    assert data["status"] == "OPERATIONAL"

@pytest.mark.anyio
async def test_url_scan_api():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.post("/api/v1/scans/url", json={"url": "http://sbi-rewards-yono.xyz/login.php"})
    assert response.status_code == 200
    data = response.json()
    assert data["risk_score"] >= 70.0
    assert "report_integrity_hash" in data

@pytest.mark.anyio
async def test_quick_login_and_alerts():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # Test Quick Login
        login_res = await ac.post("/api/v1/auth/quick-login", json={"role": "citizen"})
        assert login_res.status_code == 200
        token_data = login_res.json()
        assert "access_token" in token_data

        # Test Alerts
        alerts_res = await ac.get("/api/v1/alerts")
        assert alerts_res.status_code == 200
        alerts = alerts_res.json()
        assert len(alerts) >= 1

        # Test Analytics
        analytics_res = await ac.get("/api/v1/analytics")
        assert analytics_res.status_code == 200
        analytics = analytics_res.json()
        assert analytics["total_scans"] >= 18000
        assert len(analytics["state_heatmaps"]) >= 10
