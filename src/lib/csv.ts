export type CsvRow = {
  社員番号: string; 氏名: string; 氏名カナ: string; メール: string;
  役職: string; 部署名: string; 上司社員番号: string; 入社日: string; 退職: string;
};
export const CSV_HEADERS: (keyof CsvRow)[] = ["社員番号","氏名","氏名カナ","メール","役職","部署名","上司社員番号","入社日","退職"];
export function parseCsv(text: string): CsvRow[] {
  const lines = text.replace(/\r\n/g,"\n").replace(/\r/g,"\n").split("\n").filter(l=>l.trim()!=="");
  if (lines.length < 2) return [];
  const headers = splitCsvLine(lines[0]);
  return lines.slice(1).map(line => { const values=splitCsvLine(line); const row: Record<string,string>={}; headers.forEach((h,i)=>{row[h]=values[i]??""}); return row as CsvRow; });
}
export function generateCsv(rows: CsvRow[]): string {
  const header = CSV_HEADERS.join(",");
  const body = rows.map(row => CSV_HEADERS.map(h => escapeCsvField(row[h]??"")).join(","));
  return [header,...body].join("\n");
}
function splitCsvLine(line: string): string[] {
  const result: string[]=[]; let current=""; let inQuotes=false;
  for (let i=0;i<line.length;i++) { const char=line[i]; if(char==='"'){if(inQuotes&&line[i+1]==='"'){current+='"';i++;}else{inQuotes=!inQuotes;}}else if(char===","&&!inQuotes){result.push(current);current="";}else{current+=char;} }
  result.push(current); return result;
}
function escapeCsvField(value: string): string {
  if(value.includes(",")||value.includes('"')||value.includes("\n")) return `"${value.replace(/"/g,'""')}"`;
  return value;
}
