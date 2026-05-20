import { AppData } from '../types';
import { format } from 'date-fns';

export const exportToJSON = (data: AppData) => {
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement("a");
  link.href = url;
  link.download = `backup_ciclos_${format(new Date(), 'yyyyMMdd')}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const importFromJSON = async (file: File): Promise<AppData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        // Basic validation could go here
        if (json.settings && json.history) {
          resolve(json);
        } else {
          reject(new Error("Formato de arquivo inválido"));
        }
      } catch (e) {
        reject(e);
      }
    };
    reader.onerror = () => reject(new Error("Erro ao ler o arquivo"));
    reader.readAsText(file);
  });
};
