import { Injectable } from '@nestjs/common';
import ImageKit = require('imagekit');

@Injectable()
export class ImagekitService {
  private imagekit: ImageKit;

  constructor() {
    this.imagekit = new ImageKit({
      publicKey: process.env.IMAGEKIT_PUBLIC_KEY! as string,
      privateKey: process.env.IMAGEKIT_PRIVATE_KEY! as string,
      urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT! as string,
    });
  }

  async uploadFile(
    file: Buffer,
    fileName: string,
    folder: string = '/',
  ): Promise<any> {
    return await this.imagekit.upload({
      file,
      fileName,
      folder,
    });
  }

  getFileUrl(fileId: string): string {
    return this.imagekit.url({ path: fileId });
  }

  async deleteFile(fileId: string): Promise<any> {
    return await this.imagekit.deleteFile(fileId);
  }

  extractFileIdFromUrl(url: string): string | null {
    try {
      // This depends on your ImageKit URL structure
      // Example: https://ik.imagekit.io/your-endpoint/avatars/filename.jpg
      const urlParts = url.split('/');
      const fileName = urlParts[urlParts.length - 1];
      // You might need to adjust this based on how ImageKit stores files
      return fileName;
    } catch {
      return null;
    }
  }
}
