import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Alert, Platform } from 'react-native';

/**
 * Converts an array of objects to a CSV string.
 * Each object represents a row.
 */
const convertToCSV = (data: any[]): string => {
  if (!data || data.length === 0) return '';
  
  const headers = Object.keys(data[0]);
  const csvRows = [
    headers.join(','), // Header row
    ...data.map(row => 
      headers.map(fieldName => {
        const value = row[fieldName] !== undefined && row[fieldName] !== null ? row[fieldName] : '';
        // Escape quotes and wrap in quotes if it contains comma or newline
        const stringValue = String(value).replace(/"/g, '""');
        return (stringValue.includes(',') || stringValue.includes('\n') || stringValue.includes('"')) 
          ? `"${stringValue}"` 
          : stringValue;
      }).join(',')
    )
  ];
  
  return csvRows.join('\r\n');
};

/**
 * Generates a CSV file and prompts the user to share/save it.
 */
export const exportToCSV = async (data: any[], fileName: string = 'university_export.csv') => {
  try {
    const csvString = convertToCSV(data);
    
    // Add Web Support
    if (Platform.OS === 'web') {
      const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }

    // Native Support (iOS/Android)
    const fs = FileSystem as any;
    const directory = fs.documentDirectory || fs.cacheDirectory || '';
    if (!directory) {
      throw new Error('No storage directory available on this device');
    }
    
    const fileUri = `${directory}${fileName}`;
    console.log('Exporting CSV to:', fileUri);
    
    await fs.writeAsStringAsync(fileUri, csvString, {
      encoding: 'utf8',
    });
    
    const canShare = await Sharing.isAvailableAsync();
    if (canShare) {
      try {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'text/csv',
          dialogTitle: 'Export University Data',
          UTI: 'public.comma-separated-values-text' // Explicitly added for better iOS compatibility
        });
      } catch (shareError: any) {
        // Fallback or catch if the native share sheet crashes the intent natively
        console.warn('Share Sheet Error / Dismissed:', shareError);
      }
    } else {
      Alert.alert('Sharing Not Available', 'CSV file saved locally, but sharing is not supported on this device.');
    }
  } catch (error) {
    console.error('CSV Export Error:', error);
    Alert.alert('Export Failed', 'An error occurred while generating the CSV file.');
  }
};
