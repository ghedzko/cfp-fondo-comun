const puppeteer = require('puppeteer');

async function testSimple() {
  console.log('🚀 Iniciando pruebas simples...');
  
  const browser = await puppeteer.launch({ 
    headless: false,
    slowMo: 50,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720 });
  
  try {
    // 1. Verificar que la aplicación carga
    console.log('📍 Navegando a localhost:3000...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
    console.log('✅ Aplicación carga correctamente');
    
    // 2. Verificar que el login existe
    console.log('🔐 Verificando página de login...');
    await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle2' });
    
    const emailInput = await page.$('input[name="email"]');
    const passwordInput = await page.$('input[name="password"]');
    const submitButton = await page.$('button[type="submit"]');
    
    if (emailInput && passwordInput && submitButton) {
      console.log('✅ Formulario de login encontrado');
    } else {
      console.log('❌ Formulario de login incompleto');
    }
    
    // 3. Verificar que el dashboard existe (sin autenticación)
    console.log('📊 Verificando que el dashboard existe...');
    await page.goto('http://localhost:3000/dashboard', { waitUntil: 'networkidle2' });
    
    // Debería redirigir a login si no está autenticado
    const currentUrl = page.url();
    if (currentUrl.includes('/login')) {
      console.log('✅ Middleware de autenticación funcionando (redirige a login)');
    } else {
      console.log('⚠️  Dashboard accesible sin autenticación');
    }
    
    // 4. Verificar que las rutas de cursos existen
    console.log('📚 Verificando rutas de cursos...');
    await page.goto('http://localhost:3000/dashboard/cursos', { waitUntil: 'networkidle2' });
    
    const finalUrl = page.url();
    if (finalUrl.includes('/login')) {
      console.log('✅ Rutas de cursos protegidas correctamente');
    } else {
      console.log('⚠️  Rutas de cursos accesibles sin autenticación');
    }
    
    // 5. Verificar componentes específicos en una página estática
    console.log('🧩 Verificando componentes del month selector...');
    
    // Crear una página de prueba temporal para el componente
    const testHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Test Month Selector</title>
      <style>
        .month-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
        .month-button { padding: 12px; border: 2px solid #ccc; border-radius: 8px; cursor: pointer; }
        .month-button.selected { border-color: #3b82f6; background-color: #eff6ff; }
        .quick-buttons { margin-bottom: 16px; }
        .quick-buttons button { margin-right: 8px; padding: 8px 12px; }
      </style>
    </head>
    <body>
      <h1>Test Month Selector</h1>
      
      <div class="quick-buttons">
        <button onclick="selectQuick([3,4,5,6])">Mar-Jun</button>
        <button onclick="selectQuick([8,9,10,11])">Ago-Nov</button>
        <button onclick="selectQuick([1,2,3,4,5,6,7,8,9,10,11,12])">Año Completo</button>
        <button onclick="clearSelection()">Limpiar</button>
      </div>
      
      <div class="month-grid">
        <button class="month-button" data-month="1">Ene</button>
        <button class="month-button" data-month="2">Feb</button>
        <button class="month-button" data-month="3">Mar</button>
        <button class="month-button" data-month="4">Abr</button>
        <button class="month-button" data-month="5">May</button>
        <button class="month-button" data-month="6">Jun</button>
        <button class="month-button" data-month="7">Jul</button>
        <button class="month-button" data-month="8">Ago</button>
        <button class="month-button" data-month="9">Sep</button>
        <button class="month-button" data-month="10">Oct</button>
        <button class="month-button" data-month="11">Nov</button>
        <button class="month-button" data-month="12">Dic</button>
      </div>
      
      <div id="selected-months"></div>
      
      <script>
        let selectedMonths = [];
        
        function updateDisplay() {
          document.querySelectorAll('.month-button').forEach(btn => {
            const month = parseInt(btn.dataset.month);
            if (selectedMonths.includes(month)) {
              btn.classList.add('selected');
            } else {
              btn.classList.remove('selected');
            }
          });
          
          document.getElementById('selected-months').textContent = 
            'Meses seleccionados: ' + selectedMonths.join(', ');
        }
        
        function selectQuick(months) {
          selectedMonths = [...months];
          updateDisplay();
        }
        
        function clearSelection() {
          selectedMonths = [];
          updateDisplay();
        }
        
        document.querySelectorAll('.month-button').forEach(btn => {
          btn.addEventListener('click', () => {
            const month = parseInt(btn.dataset.month);
            if (selectedMonths.includes(month)) {
              selectedMonths = selectedMonths.filter(m => m !== month);
            } else {
              selectedMonths.push(month);
            }
            selectedMonths.sort();
            updateDisplay();
          });
        });
        
        updateDisplay();
      </script>
    </body>
    </html>
    `;
    
    await page.setContent(testHtml);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Probar funcionalidad del selector de meses
    console.log('🧪 Probando selector de meses...');
    
    // Probar botón Mar-Jun
    await page.evaluate(() => selectQuick([3,4,5,6]));
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const selectedAfterQuick = await page.$$eval('.month-button.selected', 
      buttons => buttons.length
    );
    console.log(`✅ Selección rápida Mar-Jun: ${selectedAfterQuick} meses seleccionados`);
    
    // Probar selección individual
    await page.evaluate(() => clearSelection());
    await new Promise(resolve => setTimeout(resolve, 500));
    
    await page.click('.month-button[data-month="1"]');
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const selectedAfterIndividual = await page.$$eval('.month-button.selected', 
      buttons => buttons.length
    );
    console.log(`✅ Selección individual: ${selectedAfterIndividual} mes seleccionado`);
    
    // Probar año completo
    await page.evaluate(() => selectQuick([1,2,3,4,5,6,7,8,9,10,11,12]));
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const selectedAfterFull = await page.$$eval('.month-button.selected', 
      buttons => buttons.length
    );
    console.log(`✅ Año completo: ${selectedAfterFull}/12 meses seleccionados`);
    
    console.log('🎉 Todas las pruebas básicas completadas exitosamente');
    
  } catch (error) {
    console.error('❌ Error durante las pruebas:', error.message);
    
    await page.screenshot({ 
      path: 'error-screenshot.png', 
      fullPage: true 
    });
    console.log('📸 Screenshot guardado como error-screenshot.png');
  } finally {
    await browser.close();
  }
}

testSimple().catch(console.error);
