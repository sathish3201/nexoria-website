import PDFDocument from "pdfkit";

// Replicates the layout of the original hand-built resume PDF: name
// header, bold role/tagline line, centered contact line, then sections
// (Professional Summary, Core Skills, Professional Experience, Projects,
// two-column Education | Certifications footer) separated by horizontal
// rules. Generated fresh from portfolio-site.json on each request, so
// editing that JSON keeps the PDF in sync automatically. Font sizes are
// kept small (9/9.5pt body) specifically to fit one page, matching the
// original.

const PAGE_MARGIN = 50;
const PAGE_WIDTH = 612; // US Letter, points
const CONTENT_WIDTH = PAGE_WIDTH - PAGE_MARGIN * 2;
const RULE_COLOR = "#9ca3af";
const HEADING_COLOR = "#111827";
const BODY_COLOR = "#1f2937";
const MUTED_COLOR = "#4b5563";

function hr(doc, x, y, width) {
  doc.moveTo(x, y).lineTo(x + width, y).strokeColor(RULE_COLOR).lineWidth(0.75).stroke();
}

function sectionHeading(doc, text) {
  doc.moveDown(0.35);
  doc.font("Helvetica-Bold").fontSize(11).fillColor(HEADING_COLOR).text(text);
  hr(doc, PAGE_MARGIN, doc.y + 2, CONTENT_WIDTH);
  doc.moveDown(0.3);
}

export function generateResumePdf(data, res) {
  const doc = new PDFDocument({ size: "LETTER", margin: PAGE_MARGIN });
  doc.pipe(res);

  // Header
  doc.font("Helvetica-Bold").fontSize(20).fillColor(HEADING_COLOR).text(data.meta.name);
  doc.moveDown(0.1);
  // Trimmed variant of the tagline (drop the "on the frontend"/"on the
  // backend" framing words) so this header line fits on one line at
  // this font size, matching the original resume's layout.
  const shortTagline = data.meta.tagline
    .replace(" on the frontend — ", " | ")
    .replace(" on the backend.", "");
  doc
    .font("Helvetica-Bold")
    .fontSize(10)
    .fillColor(BODY_COLOR)
    .text(`${data.meta.role} | ${shortTagline}`);
  doc.moveDown(0.1);
  const contactLine = [
    data.meta.location,
    data.meta.phone,
    data.meta.email,
    data.meta.social.linkedin.replace(/^https?:\/\//, ""),
    data.meta.social.github.replace(/^https?:\/\//, ""),
  ].join("  |  ");
  doc.font("Helvetica").fontSize(8.5).fillColor(MUTED_COLOR).text(contactLine);

  // Professional Summary
  sectionHeading(doc, "Professional Summary");
  doc.font("Helvetica").fontSize(9).fillColor(BODY_COLOR).text(data.resumeSummary, { align: "justify", lineGap: 1 });

  // Core Skills — one line per group, bold label then plain items
  sectionHeading(doc, "Core Skills");
  for (const group of data.resumeSkillGroups) {
    doc.font("Helvetica-Bold").fontSize(9).fillColor(BODY_COLOR).text(`${group.label}: `, { continued: true, lineGap: 1 });
    doc.font("Helvetica").text(group.items);
  }

  // Professional Experience — role/company on the left, dates on the
  // right of the SAME line, then bullets full-width below (not a
  // narrow side column — that's what caused the character-wrapping
  // bug in the original layout attempt).
  sectionHeading(doc, "Professional Experience");
  for (const job of data.experience) {
    const dateText = `${job.period} | ${job.location}`;
    const dateWidth = doc.font("Helvetica").fontSize(8.5).widthOfString(dateText);
    const titleWidth = CONTENT_WIDTH - dateWidth - 10;
    const rowY = doc.y;

    doc
      .font("Helvetica-Bold")
      .fontSize(9.5)
      .fillColor(HEADING_COLOR)
      .text(`${job.role} — ${job.company}`, PAGE_MARGIN, rowY, { width: titleWidth });
    const titleEndY = doc.y;

    doc
      .font("Helvetica")
      .fontSize(8.5)
      .fillColor(MUTED_COLOR)
      .text(dateText, PAGE_MARGIN + titleWidth + 10, rowY, { width: dateWidth, align: "right" });

    doc.y = Math.max(titleEndY, rowY + 11);
    doc.x = PAGE_MARGIN;
    doc.moveDown(0.15);

    for (const bullet of job.resumeAchievements || job.achievements) {
      doc.font("Helvetica").fontSize(9).fillColor(BODY_COLOR).text(`•  ${bullet}`, PAGE_MARGIN, doc.y, {
        width: CONTENT_WIDTH,
        lineGap: 1,
      });
    }
    doc.moveDown(0.2);
  }

  // Projects
  sectionHeading(doc, "Projects (Full Stack & AI, on GitHub)");
  for (const project of data.projects) {
    const links = [];
    if (project.github) links.push("Code");
    if (project.demo && project.demo !== "#") links.push("Live Demo");
    const linksText = links.length ? ` — ${links.join(" | ")}` : "";

    doc.font("Helvetica-Bold").fontSize(9).fillColor(HEADING_COLOR).text(`${project.title} — `, PAGE_MARGIN, doc.y, {
      continued: true,
      width: CONTENT_WIDTH,
    });
    doc
      .font("Helvetica")
      .fillColor(BODY_COLOR)
      .text(`${project.resumeDescription || project.description}${linksText}`, { lineGap: 0 });
    doc.moveDown(0.08);
  }

  // Education | Certifications, two columns side by side. Written with
  // explicit x/y coordinates throughout (never relying on doc.y auto-
  // advancing between the two columns' calls) — mixing two side-by-side
  // columns with pdfkit's automatic page-break-on-overflow otherwise
  // causes the second column to spill onto a new page even when there's
  // visually room, because doc.y only reflects whichever column was
  // written most recently.
  const colGap = 30;
  const colWidth = (CONTENT_WIDTH - colGap) / 2;
  const leftX = PAGE_MARGIN;
  const rightX = PAGE_MARGIN + colWidth + colGap;

  // Estimate this section's height (heading + rule + longest column's
  // rows) and force a single page break BEFORE starting it if it won't
  // fit — otherwise pdfkit's automatic per-call page-break would trigger
  // independently inside each column's loop, splitting Education and
  // Certifications onto two different pages instead of keeping the
  // whole section together.
  const rowsNeeded = Math.max(data.education.length, data.certifications.length);
  const estimatedSectionHeight = 16 + 8 + rowsNeeded * 30;
  if (doc.y + estimatedSectionHeight > doc.page.height - PAGE_MARGIN) {
    doc.addPage();
  } else {
    doc.moveDown(0.3);
  }
  const headingY = doc.y;
  doc.font("Helvetica-Bold").fontSize(11.5).fillColor(HEADING_COLOR).text("Education", leftX, headingY, { width: colWidth, lineBreak: false });
  doc.font("Helvetica-Bold").fontSize(11.5).fillColor(HEADING_COLOR).text("Certifications", rightX, headingY, { width: colWidth, lineBreak: false });
  const ruleY = headingY + 16;
  hr(doc, leftX, ruleY, colWidth);
  hr(doc, rightX, ruleY, colWidth);

  let leftY = ruleY + 8;
  for (const edu of data.education) {
    doc.font("Helvetica-Bold").fontSize(9).fillColor(HEADING_COLOR).text(edu.degree, leftX, leftY, { width: colWidth, lineBreak: true });
    leftY = doc.y;
    doc.font("Helvetica").fillColor(BODY_COLOR).text(`${edu.school} | ${edu.period}`, leftX, leftY, { width: colWidth, lineBreak: true });
    leftY = doc.y + 6;
  }

  let rightY = ruleY + 8;
  for (const cert of data.certifications) {
    doc.font("Helvetica-Bold").fontSize(9).fillColor(HEADING_COLOR).text(cert.name, rightX, rightY, { width: colWidth, lineBreak: true });
    rightY = doc.y;
    const suffix = `${cert.issuer ? `${cert.issuer} — ` : ""}${cert.year}`;
    doc.font("Helvetica").fillColor(BODY_COLOR).text(suffix, rightX, rightY, { width: colWidth, lineBreak: true });
    rightY = doc.y + 6;
  }

  doc.end();
}
