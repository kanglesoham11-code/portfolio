import os
from fpdf import FPDF

class PDF(FPDF):
    def footer(self):
        self.set_y(-15)
        self.set_font("helvetica", "I", 8)
        self.cell(0, 10, f"Page {self.page_no()}/{{nb}}", align="C")

# We can render the basic HTML we wrote earlier. fpdf2 parses simple HTML perfectly.
html_content = """
<h1 align="center">SOHAM KIRAN KANGLE</h1>
<p align="center">kanglesoham11@gmail.com | +91 8275328344 | Pune, India | linkedin.com/in/soham-kangle-404ab6366</p>

<h2>PROFESSIONAL SUMMARY</h2>
<p>Data Engineering-focused Information Technology student at PVG COET with hands-on experience designing and deploying automated data pipelines, ETL workflows, and distributed data processing systems using Python, SQL, FastAPI, and AWS. Proven ability to architect multi-source data ingestion systems, vector databases, and real-time streaming pipelines. GUVi National Hackathon Finalist.</p>

<h2>EDUCATION</h2>
<p><b>Pune Vidyarthi Griha's College of Engineering and Technology</b><br>
<i>Bachelor of Engineering - Information Technology</i> | Pune, India | Expected May 2028 (2nd Year)<br>
<b>Coursework:</b> Data Structures & Algorithms, Database Management Systems, Operating Systems, Computer Networks, Data Modeling, Distributed Systems</p>

<h2>TECHNICAL SKILLS</h2>
<ul>
  <li><b>Languages:</b> Python, SQL, JavaScript, TypeScript, C++, Java</li>
  <li><b>Data Engineering:</b> ETL/ELT Pipeline Design, Data Warehousing, Data Modeling, Schema Design, Log Event Processing</li>
  <li><b>Databases & Storage:</b> PostgreSQL, MySQL, ChromaDB (Vector DB), DynamoDB, SQL Query Optimization, Data Lake Architecture</li>
  <li><b>AWS & Cloud:</b> Amazon S3, AWS Glue, Amazon Redshift, AWS Lambda, Amazon Athena</li>
  <li><b>Frameworks:</b> FastAPI, Apache Kafka, Pandas, NumPy, LangGraph, React, Node.js, Next.js, Streamlit, OpenAI Agents SDK</li>
  <li><b>AI/ML & Analytics:</b> Groq LLaMA 3.3 70B, Multi-Agent Orchestration, RAG, Semantic Search, ElevenLabs TTS</li>
</ul>

<h2>PROJECTS</h2>
<p><b>Competitor Intelligence Engine - Automated ETL Data Pipeline</b></p>
<ul>
  <li>Designed and implemented a 4-agent ETL pipeline that autonomously ingests multi-source competitor data.</li>
  <li>Built a data schema for structured competitor records and sales battlecards; automated data quality validation.</li>
  <li>Architected a full-stack SaaS product with FastAPI backend, React dashboard, and Stripe monetization layer.</li>
</ul>

<p><b>HIREPATH - Autonomous Recruitment Data Pipeline</b></p>
<ul>
  <li>Architected a 5-stage stateful data pipeline (SCOUT to TRACK) using LangGraph orchestration.</li>
  <li>Built a FastAPI backend with ChromaDB vector storage and SQL-backed candidate profiles.</li>
  <li>Developed a React frontend with real-time WebSocket pipeline visibility.</li>
</ul>

<p><b>Verified Professional Network - Biometric Data Platform</b></p>
<ul>
  <li>Designed and implemented a data schema for biometric authentication records and user identity logs.</li>
  <li>Secured enterprise-grade user data flows through multi-layer biometric verification.</li>
</ul>

<p><b>Cybersecurity Threat Intelligence Pipeline</b></p>
<ul>
  <li>Engineered a proactive adversarial AI agent that autonomously collects, parses, and stores IOC data.</li>
  <li>Simulated multi-persona attacker engagement, capturing structured IOC records in machine-readable format.</li>
  <li>GUVi National Hackathon Finalist (2024-25).</li>
</ul>

<p><b>Voice Customer Support Agent - Real-Time Streaming System</b></p>
<ul>
  <li>Developed a real-time voice support agent integrating Groq LLM inference with ElevenLabs TTS.</li>
  <li>Resolved critical async/event-loop conflicts and SDK API mismatches.</li>
</ul>

<h2>ACHIEVEMENTS</h2>
<ul>
  <li><b>GUVi National Hackathon Finalist (2024-25):</b> Selected among top student teams nationally for the Cybersecurity Threat Intelligence Agent.</li>
  <li><b>Agentic AI Hackathon Competitor:</b> Presented the production-grade HIREPATH 5-agent data pipeline system.</li>
  <li><b>Academic Excellence:</b> Consistent top performer in DBMS and DSA; independently built production-grade data engineering projects.</li>
</ul>
"""

pdf = PDF()
pdf.add_page()
pdf.set_font("helvetica", size=10)
pdf.write_html(html_content)

output_path = "assets/Soham_Kangle_Resume.pdf"
pdf.output(output_path)
print("Generated", output_path)
