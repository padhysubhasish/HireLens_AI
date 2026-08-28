"""
Generates sample_resume.pdf for Rahul Sharma. Run with:
    python generate_sample_resume.py
Requires: pip install reportlab
"""
import os

from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, ListFlowable, ListItem

OUTPUT_PATH = os.path.join(os.path.dirname(__file__), "sample_resume.pdf")

styles = getSampleStyleSheet()
name_style = ParagraphStyle("Name", parent=styles["Title"], fontSize=20, spaceAfter=2)
role_style = ParagraphStyle("Role", parent=styles["Normal"], fontSize=13, textColor="#2563eb", spaceAfter=12)
heading_style = ParagraphStyle("Heading", parent=styles["Heading2"], spaceBefore=14, spaceAfter=6)
body_style = ParagraphStyle("Body", parent=styles["Normal"], fontSize=10.5, leading=15)


def build():
    doc = SimpleDocTemplate(OUTPUT_PATH, pagesize=letter, topMargin=0.7 * inch, bottomMargin=0.7 * inch)
    story = []

    story.append(Paragraph("Rahul Sharma", name_style))
    story.append(Paragraph("Full-Stack AI Developer", role_style))

    story.append(Paragraph("Summary", heading_style))
    story.append(Paragraph(
        "Rahul Sharma is a software developer with 3 years of experience building web "
        "applications and AI-powered products.", body_style))

    story.append(Paragraph("Skills", heading_style))
    skills = ["Python", "FastAPI", "React", "JavaScript", "PostgreSQL", "REST APIs",
              "Docker", "Git", "Machine Learning", "OpenAI API", "Google Gemini API"]
    story.append(Paragraph(", ".join(skills), body_style))

    story.append(Paragraph("Experience", heading_style))
    story.append(Paragraph("<b>Software Developer</b> &mdash; Tech Solutions Pvt Ltd (2023&ndash;Present)", body_style))
    responsibilities = [
        "Developed REST APIs using Python and FastAPI.",
        "Built responsive React applications.",
        "Designed PostgreSQL databases.",
        "Integrated LLM APIs into internal applications.",
        "Developed an AI-powered customer support chatbot.",
        "Containerized applications using Docker.",
        "Implemented authentication and authorization.",
        "Worked with Git and GitHub.",
    ]
    story.append(ListFlowable(
        [ListItem(Paragraph(r, body_style)) for r in responsibilities],
        bulletType="bullet", start="circle", spaceBefore=4,
    ))

    story.append(Paragraph("Projects", heading_style))
    story.append(Paragraph("<b>AI Resume Analyzer</b> &mdash; Built an application that extracts resume "
                            "information and uses an LLM to compare candidates against job descriptions.", body_style))
    story.append(Spacer(1, 4))
    story.append(Paragraph("<b>AI Customer Support Assistant</b> &mdash; Developed a multi-turn AI assistant "
                            "using an LLM API and FastAPI.", body_style))

    story.append(Paragraph("Education", heading_style))
    story.append(Paragraph("B.Tech in Computer Science", body_style))

    doc.build(story)
    print(f"Wrote {OUTPUT_PATH}")


if __name__ == "__main__":
    build()
