
interface IChunk {
    data : any;
    type : 'string' | 'builder';
}

export default class CodeBuilder {
    private _chunks : Array<string | CodeBuilder> = [];
    private _indentationSize : number = 0;

    public setIndentationSize(size : number) : CodeBuilder {
        this._indentationSize = size;
        return this;
    }
    public getIndentationSize() {
        return this._indentationSize;
    }
    public add(codeBuilder : CodeBuilder) : CodeBuilder;
    public add(str : string) : CodeBuilder;
    public add(codeBuilderParts : CodeBuilder[]) : CodeBuilder;
    public add(codeParts: string[]) : CodeBuilder;
    public add(codeParts: Array<string|CodeBuilder>) : CodeBuilder;
    public add(args : any) : CodeBuilder {
        if(typeof args == 'string' || args instanceof CodeBuilder) {
            this._chunks.push(args);
        } else if (Array.isArray(args)){
            args.forEach(x => {
                this.add(x);
            });
        }
        return this;
    }

    public clear() {
        this._chunks = [];
    }

    private _buildCodeParts() : string[] {
        const indentation = new Array<string>(this._indentationSize).fill('\t').join('');

        let output : string[] = [];
        this._chunks.forEach(part => {
            if(part instanceof CodeBuilder) {
                const parts = part._buildCodeParts().map(x => [indentation, x].join(''));
                output = [
                    ...output,
                    ...parts
                ];
            } else {
                output.push([indentation, part].join(''));
            }
        });
        return output;
    }

    public toString() {
        const chunks = this._buildCodeParts();
        return chunks.join('\n');
    }
}