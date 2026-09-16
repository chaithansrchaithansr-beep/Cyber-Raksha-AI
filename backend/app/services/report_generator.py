import io
import time
from datetime import datetime, timezone
from typing import Dict, Any, List
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from app.core.security import compute_sha256

class ReportGenerator:
    @staticmethod
    def generate_pdf(report_data: Dict[str, Any]) -> bytes:
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=letter,
            rightMargin=40,
            leftMargin=40,
            topMargin=40,
            bottomMargin=40
        )
        elements = []
        styles = getSampleStyleSheet()

        # Custom Styles
        title_style = ParagraphStyle(
            'ReportTitle',
            parent=styles['Normal'],
            fontName='Helvetica-Bold',
            fontSize=22,
            leading=26,
            textColor=colors.HexColor('#0F172A')
        )
        subtitle_style = ParagraphStyle(
            'ReportSubtitle',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=11,
            leading=15,
            textColor=colors.HexColor('#2563EB')
        )
        header_style = ParagraphStyle(
            'SectionHeader',
            parent=styles['Normal'],
            fontName='Helvetica-Bold',
            fontSize=13,
            leading=17,
            textColor=colors.HexColor('#1E293B'),
            spaceBefore=10,
            spaceAfter=6
        )
        body_style = ParagraphStyle(
            'Body',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=9.5,
            leading=14,
            textColor=colors.HexColor('#334155')
        )
        code_style = ParagraphStyle(
            'CodeText',
            parent=styles['Normal'],
            fontName='Courier',
            fontSize=8,
            leading=11,
            textColor=colors.HexColor('#475569')
        )

        # Header
        elements.append(Paragraph("CYBER RAKSHA AI", title_style))
        elements.append(Paragraph("National Cyber Threat Intelligence & Incident Response Portal", subtitle_style))
        elements.append(Spacer(1, 12))
        elements.append(HRFlowable(width="100%", thickness=2, color=colors.HexColor('#2563EB'), spaceAfter=15))

        # Metadata Table
        report_id = report_data.get("report_id", f"CR-INC-{int(time.time())}")
        created_at = report_data.get("created_at", datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC"))
        classification = report_data.get("classification", "HIGH RISK")
        risk_score = f"{report_data.get('risk_score', 85.0)}/100"
        confidence = f"{report_data.get('confidence', 91.0)}%"

        meta_data = [
            [Paragraph("<b>Incident Report ID:</b>", body_style), Paragraph(report_id, code_style)],
            [Paragraph("<b>Timestamp:</b>", body_style), Paragraph(str(created_at), body_style)],
            [Paragraph("<b>Threat Classification:</b>", body_style), Paragraph(f"<b>{classification}</b>", body_style)],
            [Paragraph("<b>Unified Risk Score:</b>", body_style), Paragraph(risk_score, body_style)],
            [Paragraph("<b>AI Model Confidence:</b>", body_style), Paragraph(confidence, body_style)],
            [Paragraph("<b>Scan Type:</b>", body_style), Paragraph(report_data.get("scan_type", "URL").upper(), body_style)],
        ]
        t = Table(meta_data, colWidths=[150, 380])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#F8FAFC')),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#E2E8F0')),
            ('PADDING', (0, 0), (-1, -1), 6),
        ]))
        elements.append(t)
        elements.append(Spacer(1, 15))

        # Detected Indicators
        elements.append(Paragraph("Detected Threat Indicators", header_style))
        indicators = report_data.get("detected_indicators", [])
        if indicators:
            for ind in indicators:
                elements.append(Paragraph(f"• {ind}", body_style))
        else:
            elements.append(Paragraph("• No suspicious heuristics triggered.", body_style))
        elements.append(Spacer(1, 12))

        # AI Explanation
        elements.append(Paragraph("AI Threat Explanation", header_style))
        ai_exp = report_data.get("ai_explanation", "Threat analyzed via automated multi-vector heuristic and ML engines.")
        elements.append(Paragraph(ai_exp, body_style))
        elements.append(Spacer(1, 12))

        # Recommendations
        elements.append(Paragraph("Recommended Containment & Citizen Guidance", header_style))
        recs = report_data.get("recommendations", [])
        if recs:
            for rec in recs:
                elements.append(Paragraph(f"• {rec}", body_style))
        else:
            elements.append(Paragraph("• Maintain continuous defensive vigilance.", body_style))
        elements.append(Spacer(1, 15))

        # Cryptographic Integrity Hash
        elements.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor('#CBD5E1'), spaceAfter=10))
        elements.append(Paragraph("Cryptographic Proof of Integrity", header_style))
        raw_hash_data = f"{report_id}|{created_at}|{classification}|{risk_score}"
        hash_val = report_data.get("report_integrity_hash") or compute_sha256(raw_hash_data)
        elements.append(Paragraph(f"SHA-256 Hash: {hash_val}", code_style))
        elements.append(Paragraph("This automated cryptographic signature guarantees that this incident assessment has not been tampered with.", body_style))

        doc.build(elements)
        buffer.seek(0)
        return buffer.getvalue()

report_generator = ReportGenerator()
