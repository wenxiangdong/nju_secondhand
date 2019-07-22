export default class Logger {

    constructor(tag: string) {
        this.tag = tag;
    }
  
    info = (...contents) => {
      if (!console.info) {
        this.log(...contents)
      } else {
        console.info(`【${this.tag}】`);
        let time = new Date().toLocaleTimeString();
        console.info(time);
        for (let item of contents) {
          console.info(item);
        }
        console.info('---------------------------');
      }
    }
  
    error = (...contents) => {
      if (!console.error) {
        this.log(...contents)
      } else {
        console.error(`【${this.tag}】`);
        let time = new Date().toLocaleTimeString();
        console.error(time);
        for (let item of contents) {
          console.error(item)
        }
        console.error('---------------------------');
      }
    }
  
    log = (...contents) => {
      console.log(`【${this.tag}】`);
      let time = new Date().toLocaleTimeString();
      console.log(time);
      for (let item of contents) {
        console.log(item)
      }
      console.log('---------------------------');
    }
  
    static getLogger(tag) {
      return new Logger(tag);
    }
  }
  