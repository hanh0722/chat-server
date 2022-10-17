export class ResponseEntity<T = any, M = any> {
  constructor(public code: number, public message: M, public data?: T) {

  }
}