import CodeBuilder from "../code-builder";

export interface IBuilder<T> {
    build() : T;
}
export default class BaseBuilder {
    constructor(protected code : CodeBuilder){}
}