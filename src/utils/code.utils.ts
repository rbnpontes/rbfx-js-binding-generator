import { IEnumeratorToken, IListToken, ITypeToken } from "../types/metadata-def";

const PROPERTY_PREFIXES = ['Is', 'Has', 'Get', 'Set'];
export default class CodeUtils {
    public static getPropName(propName: string) {
        let result = propName;
        PROPERTY_PREFIXES.forEach(prefix => result = result.replace(prefix, ''));
        return this.normalizeName(result);
    }
    public static normalizeName(name: string) {
        if (!name)
            return '';
        let char = name.charAt(0).toLowerCase();
        return char + name.substring(1, name.length);
    }

    public static getTypeVarDeclaration(type: ITypeToken) {
        let output: string[] = [];
        switch (type.type) {
            case 'primitive':
                {
                    const isPointer = type.name == 'Object';
                    output.push(type.name);
                    if (isPointer)
                        output.push('*');
                }
                break;
            case 'class':
                output = [type.name, '*'];
                break;
            case 'shared_ptr':
                output = ['SharedPtr<', type.name,'>'];
                break;
            case 'weak_ptr':
                output = ['WeakPtr<', type.name, '>'];
                break;
            case 'list':
                output = [`ea::vector<`, this.getTypeVarDeclaration((type as IListToken).target), '>'];
                break;
            case 'enum':
                output = [(type as IEnumeratorToken).enumType == 'number' ? type.name : 'const char*'];
                break;
            default:
                throw 'not implemented this type name.';
        }
        return output.join('');
    }
}