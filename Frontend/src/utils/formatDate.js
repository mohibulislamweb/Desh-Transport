// src/utils/formatDate.js
export const formatToBDTime = (dateString) => {
  if (!dateString) return '';
  
  return new Date(dateString).toLocaleString('en-US', {
    timeZone: 'Asia/Dhaka',
    dateStyle: 'medium',  
    timeStyle: 'short',    
    hour12: true
  });
};