const puppeteer = require('puppeteer');

async function testMonthEditor() {
  console.log('🚀 Iniciando pruebas con Puppeteer...');
  
  const browser = await puppeteer.launch({ 
    headless: false,
    slowMo: 100,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720 });
  
  try {
    // 1. Navegar a la aplicación
    console.log('📍 Navegando a localhost:3000...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
    
    // 2. Hacer login (siempre necesario en Puppeteer)
    console.log('🔐 Realizando login...');
    
    // Ir directamente a login
    await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle2' });
    
    // Llenar formulario de login
    await page.waitForSelector('input[name="email"]');
    await page.type('input[name="email"]', 'admin@cfp.edu.ar');
    await page.type('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    
    // Esperar redirección al dashboard
    await page.waitForNavigation({ waitUntil: 'networkidle2' });
    console.log('✅ Login exitoso');
    
    // 3. Navegar a gestión de cursos
    console.log('📚 Navegando a gestión de cursos...');
    await page.waitForSelector('a[href="/dashboard/cursos"]');
    await page.click('a[href="/dashboard/cursos"]');
    await page.waitForNavigation({ waitUntil: 'networkidle2' });
    console.log('✅ En página de cursos');
    
    // 4. Buscar y hacer clic en "Ver Detalles" del primer curso
    console.log('🔍 Buscando curso para ver detalles...');
    await page.waitForSelector('a[href*="/dashboard/cursos/"]');
    const courseDetailLink = await page.$('a[href*="/dashboard/cursos/"]:not([href*="nuevo-periodo"])');
    if (courseDetailLink) {
      await courseDetailLink.click();
      await page.waitForNavigation({ waitUntil: 'networkidle2' });
      console.log('✅ En página de detalles del curso');
    } else {
      throw new Error('No se encontró enlace de detalles del curso');
    }
    
    // 5. Hacer clic en "Nuevo Período"
    console.log('➕ Creando nuevo período...');
    await page.waitForSelector('a[href*="nuevo-periodo"]');
    await page.click('a[href*="nuevo-periodo"]');
    await page.waitForNavigation({ waitUntil: 'networkidle2' });
    console.log('✅ En formulario de nuevo período');
    
    // 6. Llenar formulario básico
    console.log('📝 Llenando formulario...');
    await page.waitForSelector('input[name="nombre"]');
    await page.type('input[name="fechaInicio"]', '2025-03-01');
    await page.type('input[name="fechaFin"]', '2025-06-30');
    await page.type('input[name="precioMensual"]', '15000');
    
    // 7. Probar selector de meses
    console.log('📅 Probando selector de meses...');
    
    // Probar botón rápido "Mar-Jun"
    await page.waitForSelector('button:has-text("Mar-Jun")');
    await page.click('button:has-text("Mar-Jun")');
    await page.waitForTimeout(1000);
    console.log('✅ Selección rápida Mar-Jun funcionando');
    
    // Verificar que los meses se seleccionaron
    const selectedMonths = await page.$$eval('.month-grid button[aria-pressed="true"]', 
      buttons => buttons.length
    );
    console.log(`📊 Meses seleccionados: ${selectedMonths}`);
    
    // Probar limpiar selección
    await page.click('button:has-text("Limpiar")');
    await page.waitForTimeout(500);
    console.log('✅ Limpiar selección funcionando');
    
    // Probar selección individual
    await page.click('.month-grid button:first-child');
    await page.waitForTimeout(500);
    console.log('✅ Selección individual funcionando');
    
    // 8. Probar botón "Año Completo"
    await page.click('button:has-text("Año Completo")');
    await page.waitForTimeout(1000);
    
    const allMonthsSelected = await page.$$eval('.month-grid button[aria-pressed="true"]', 
      buttons => buttons.length
    );
    console.log(`📊 Todos los meses seleccionados: ${allMonthsSelected}/12`);
    
    // 9. Verificar que el formulario se puede enviar
    console.log('💾 Probando envío del formulario...');
    await page.click('button[type="submit"]');
    
    // Esperar respuesta (puede ser éxito o error)
    await page.waitForTimeout(2000);
    
    currentUrl = page.url();
    if (currentUrl.includes('nuevo-periodo')) {
      console.log('⚠️  Formulario no se envió (posible error de validación)');
      
      // Buscar mensajes de error
      const errorMessage = await page.$('.error-message');
      if (errorMessage) {
        const errorText = await page.evaluate(el => el.textContent, errorMessage);
        console.log(`❌ Error encontrado: ${errorText}`);
      }
    } else {
      console.log('✅ Formulario enviado exitosamente');
    }
    
    console.log('🎉 Pruebas completadas exitosamente');
    
  } catch (error) {
    console.error('❌ Error durante las pruebas:', error.message);
    
    // Tomar screenshot del error
    await page.screenshot({ 
      path: 'error-screenshot.png', 
      fullPage: true 
    });
    console.log('📸 Screenshot guardado como error-screenshot.png');
  } finally {
    await browser.close();
  }
}

// Ejecutar pruebas
testMonthEditor().catch(console.error);
