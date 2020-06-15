import csvParse from 'csv-parse';
import fs from 'fs';
import path from 'path';
import uploadConfig from '../config/upload';

interface Transaction {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category_title: string;
}

interface File {
  lines: Array<Transaction>;
}

export default class CSV {
  private csvFile: File;

  constructor() {
    this.csvFile = { lines: [] };
  }

  public async loadCSV(csvFileName: string): Promise<File> {
    const csvFilePath = path.join(uploadConfig.directory, csvFileName);
    const readCSVStream = fs.createReadStream(csvFilePath);

    const parseStream = csvParse({
      from_line: 2,
      ltrim: true,
      rtrim: true,
    });

    const parseCSV = readCSVStream.pipe(parseStream);

    parseCSV.on('data', line => {
      this.csvFile.lines = [
        ...this.csvFile.lines,
        {
          title: line[0],
          type: line[1],
          value: line[2],
          category_title: line[3],
        },
      ];
    });

    await new Promise(resolve => {
      parseCSV.on('end', resolve);
    });

    await fs.promises.unlink(csvFilePath);

    return this.csvFile;
  }
}
