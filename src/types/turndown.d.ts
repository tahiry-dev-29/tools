declare module 'turndown' {
  export default class TurndownService {
    constructor(options?: any);
    turndown(html: string): string;
  }
}
