export class PagedResponse<Type> {
  page: number;
  pageSize: number;
  total: number;
  items: Type[];
  constructor(page: number, pageSize: number, total: number, items: Type[]) {
    this.page = page;
    this.pageSize = pageSize;
    this.total = total;
    this.items = items;
  }
}
