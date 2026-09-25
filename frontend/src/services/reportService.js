import api from './api';

const reportService = {
  downloadReport: async (type, startDate, endDate) => {
    let url = `/reports/${type}`;
    const params = [];
    if (startDate) params.push(`startDate=${startDate}`);
    if (endDate) params.push(`endDate=${endDate}`);
    if (params.length > 0) url += `?${params.join('&')}`;

    // Need to handle blob response
    const response = await api.get(url, { responseType: 'blob' });
    
    // Create a download link
    const downloadUrl = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.setAttribute('download', `${type}_report.csv`);
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);
  }
};

export default reportService;
