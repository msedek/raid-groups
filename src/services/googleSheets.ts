// Función para obtener datos del Google Sheet público
export const fetchGoogleSheetData = async (): Promise<any[]> => {
  try {
    // URL del Google Sheet (convertir a formato CSV)
    const sheetId = '192L_bNFQJq_hgYKoi9IuFJqLYGUx_vIiwaEwJD3UTHg';
    const gid = '786337769';
    const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`;
    
    console.log('Fetching from URL:', csvUrl);
    
    const response = await fetch(csvUrl, {
      method: 'GET',
      mode: 'cors',
      headers: {
        'Accept': 'text/csv',
      }
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const csvText = await response.text();
    console.log('CSV text received:', csvText.substring(0, 500));
    
    return parseCSVData(csvText);
  } catch (error) {
    console.error('Error fetching Google Sheet data:', error);
    throw error;
  }
};

// Función para parsear los datos CSV y convertirlos a la estructura de la aplicación
const parseCSVData = (csvText: string): any[] => {
  const lines = csvText.split('\n').filter(line => line.trim());
  
  if (lines.length === 0) {
    return [];
  }
  
  console.log('CSV Lines:', lines);
  
  // Obtener datos (todas las líneas)
  const data = lines.map((line, index) => {
    const values = parseCSVLine(line);
    const row: any = {};
    
    // Crear columnas A, B, C, D, etc.
    values.forEach((value, columnIndex) => {
      const columnName = String.fromCharCode(65 + columnIndex); // A, B, C, D...
      row[columnName] = value || '';
    });
    
    console.log(`Row ${index + 1}:`, row);
    return row;
  });
  
  return data;
};

// Función para parsear una línea CSV correctamente (maneja comillas)
const parseCSVLine = (line: string): string[] => {
  // Limpiar caracteres de retorno de carro
  const cleanLine = line.replace(/\r/g, '');
  
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < cleanLine.length; i++) {
    const char = cleanLine[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current.trim());
  return result;
};

// Función para convertir los datos del sheet a la estructura de grupos de raids
export const convertSheetDataToRaidGroups = (sheetData: any[]): any[] => {
  if (!sheetData || sheetData.length === 0) {
    console.log('No sheet data available');
    return [];
  }
  
  console.log('Converting sheet data:', sheetData);
  
  const raidGroups: any[] = [];
  
  // Crear grupos específicos basados en la estructura del sheet
  const mordumRaids: any[] = [
    { name: 'Spicy Meatball', members: [] },
    { name: 'Weekly Parse', members: [] },
    { name: '99 Problems', members: [] },
    { name: 'Cripple Fight', members: [] },
    { name: 'Too Many Cooks', members: [] },
    { name: 'The Leftovers', members: [] }
  ];
  
  const brelRaids: any[] = [
    { name: 'Brel HM1', members: [] },
    { name: 'Brel HM2', members: [] },
    { name: 'Brel HM3', members: [] },
    { name: 'Brel HM4', members: [] },
    { name: 'Brel HM5', members: [] },
    { name: 'Brel HM6', members: [] }
  ];
  
  const strikeRaids: any[] = [
    { name: 'Strike HM1', members: [] },
    { name: 'Strike NM1', members: [] },
    { name: 'Strike NM2', members: [] },
    { name: 'Strike NM3', members: [] },
    { name: 'Strike NM4', members: [] },
    { name: 'Strike NM5', members: [] }
  ];
  
  // Procesar cada fila del sheet
  sheetData.forEach((row, rowIndex) => {
    console.log(`Row ${rowIndex + 1}:`, row);
    
    // Fila 2: Spicy Meatball, Weekly Parse, 99 Problems, Cripple Fight, Too Many Cooks, The Leftovers
    if (rowIndex === 1) {
      const columns = ['B', 'C', 'D', 'E', 'F', 'G'];
      columns.forEach((col, index) => {
        if (mordumRaids[index]) {
          mordumRaids[index].name = row[col] || mordumRaids[index].name;
        }
      });
    }
    
    // Fila 3: Mordum HM1, Mordum HM2, Mordum HM3, Mordum HM4, Mordum HM5, Mordum NM2
    if (rowIndex === 2) {
      const columns = ['B', 'C', 'D', 'E', 'F', 'G'];
      columns.forEach((col, index) => {
        if (mordumRaids[index]) {
          mordumRaids[index].name = row[col] || mordumRaids[index].name;
        }
      });
    }
    
    // Filas 4-10: Miembros de Mordum
    if (rowIndex >= 3 && rowIndex <= 9) {
      const columns = ['B', 'C', 'D', 'E', 'F', 'G'];
      columns.forEach((col, index) => {
        const member = row[col];
        if (member && member.toString().trim() !== '') {
          mordumRaids[index].members.push(member.toString().trim());
        }
      });
    }
    
    // Fila 12: Brel HM1, Brel HM2, Brel HM3, Brel HM4, Brel HM5, Brel HM6
    if (rowIndex === 11) {
      const columns = ['B', 'C', 'D', 'E', 'F', 'G'];
      columns.forEach((col, index) => {
        if (brelRaids[index]) {
          brelRaids[index].name = row[col] || brelRaids[index].name;
        }
      });
    }
    
    // Filas 13-19: Miembros de Brel
    if (rowIndex >= 12 && rowIndex <= 18) {
      const columns = ['B', 'C', 'D', 'E', 'F', 'G'];
      columns.forEach((col, index) => {
        const member = row[col];
        if (member && member.toString().trim() !== '') {
          brelRaids[index].members.push(member.toString().trim());
        }
      });
    }
    
    // Fila 30: Strike HM1, Strike NM1, Strike NM2, Strike NM3, Strike NM4, Strike NM5
    if (rowIndex === 29) {
      const columns = ['B', 'C', 'D', 'E', 'F', 'G'];
      columns.forEach((col, index) => {
        if (strikeRaids[index]) {
          strikeRaids[index].name = row[col] || strikeRaids[index].name;
        }
      });
    }
    
    // Filas 31-37: Miembros de Strike
    if (rowIndex >= 30 && rowIndex <= 36) {
      const columns = ['B', 'C', 'D', 'E', 'F', 'G'];
      columns.forEach((col, index) => {
        const member = row[col];
        if (member && member.toString().trim() !== '') {
          strikeRaids[index].members.push(member.toString().trim());
        }
      });
    }
  });
  
  // Agregar grupos con raids que tengan miembros
  if (mordumRaids.some(raid => raid.members.length > 0)) {
    raidGroups.push({
      name: 'Mordum',
      raids: mordumRaids.filter(raid => raid.members.length > 0)
    });
  }
  
  if (brelRaids.some(raid => raid.members.length > 0)) {
    raidGroups.push({
      name: 'Brel',
      raids: brelRaids.filter(raid => raid.members.length > 0)
    });
  }
  
  if (strikeRaids.some(raid => raid.members.length > 0)) {
    raidGroups.push({
      name: 'Strike',
      raids: strikeRaids.filter(raid => raid.members.length > 0)
    });
  }
  
  console.log('Final raid groups:', raidGroups);
  return raidGroups;
};
