const puppeteer = require('puppeteer');

(async () => {
  try {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    const htmlContent = require('fs').readFileSync('Soham_Kangle_Resume.html', 'utf8');
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    await page.pdf({ 
      path: 'assets/Soham_Kangle_Resume.pdf', 
      format: 'A4', 
      printBackground: true, 
      margin: { top: '15mm', right: '15mm', bottom: '15mm', left: '15mm' } 
    });
    await browser.close();
    console.log('PDF generated successfully!');
  } catch (error) {
    console.error('Error generating PDF:', error);
    process.exit(1);
  }
})();
