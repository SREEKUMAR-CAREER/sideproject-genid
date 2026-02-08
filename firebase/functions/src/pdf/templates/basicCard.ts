
interface CardData {
    company: {
        name: string;
        logo: string;
    };
    employee: Record<string, any>;
    photo: string;
    qrCode: string;
    template: {
        width: number;
        height: number;
        dpi: number;
    };
}

export const getCardTemplate = (data: any): string => {
    // Map incoming data to strict Interface if needed, but for flexibility keeping simple
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      width: ${data.template.width}mm;
      height: ${data.template.height}mm;
      font-family: Arial, sans-serif;
      background: white;
      margin: 0;
    }
    
    .card {
      width: ${data.template.width}mm;
      height: ${data.template.height}mm;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 5mm;
      position: relative;
      color: white;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }
    
    .header {
      display: flex;
      align-items: center;
      gap: 3mm;
      margin-bottom: 4mm;
      border-bottom: 1px solid rgba(255,255,255,0.3);
      padding-bottom: 2mm;
    }
    
    .logo {
      width: 10mm;
      height: 10mm;
      object-fit: contain;
      background: white;
      border-radius: 50%;
      padding: 1mm;
    }
    
    .company-name {
      font-size: 3.5mm;
      font-weight: bold;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .content {
      display: flex;
      gap: 4mm;
      flex: 1;
    }
    
    .photo-section {
      width: 25mm;
      flex-shrink: 0;
    }
    
    .photo {
      width: 25mm;
      height: 30mm;
      object-fit: cover;
      border: 1mm solid white;
      border-radius: 2mm;
      background: #eee;
    }
    
    .info-section {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 2mm;
    }
    
    .info-row {
      line-height: 1.2;
    }
    
    .label {
      font-size: 1.8mm;
      opacity: 0.8;
      text-transform: uppercase;
      margin-bottom: 0.5mm;
    }
    
    .value {
      font-size: 2.8mm;
      font-weight: bold;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    
    .footer {
      position: absolute;
      bottom: 3mm;
      right: 3mm;
      background: white;
      padding: 1mm;
      border-radius: 1mm;
    }
    
    .qr-code {
      width: 12mm;
      height: 12mm;
      display: block;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      ${data.company.logo ? `<img src="${data.company.logo}" alt="Logo" class="logo" />` : ''}
      <div class="company-name">${data.company.name}</div>
    </div>
    
    <div class="content">
      <div class="photo-section">
        <img src="${data.photo || 'https://via.placeholder.com/100'}" alt="Employee" class="photo" />
      </div>
      
      <div class="info-section">
        ${Object.entries(data.employee || {}).map(([key, value]) => {
        if (["photo", "qrCode", "id"].includes(key)) return ''; // Skip internal fields
        const label = key.replace(/_/g, ' ');
        return `
            <div class="info-row">
              <div class="label">${label}</div>
              <div class="value">${value}</div>
            </div>
          `;
    }).join('')}
      </div>
    </div>
    
    <div class="footer">
      <img src="${data.qrCode}" alt="QR Code" class="qr-code" />
    </div>
  </div>
</body>
</html>
  `;
};
