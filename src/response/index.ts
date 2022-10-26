export class ResponseEntity<T = any, M = any> {
  constructor(public code: number, public message: M, public data?: T) {

  }
}

export class SortModel<T = any> {
  constructor(public data: T, public total: number, public load_more_able: boolean, public page: number) {}
  
}