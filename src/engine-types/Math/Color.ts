import { addMethod, addPrimitive, addStaticVariables, addVariables, setMethodArgs, setMethodReturn, setOperatorFlags } from "../../metadata";
import { OperatorFlags } from "../../types/metadata-def";

export default function defineColor() {
    addPrimitive(()=> {
        addVariables([
            ["r", "float"],
            ["g", "float"],
            ["b", "float"],
            ["a", "float"]
        ]);
        addStaticVariables([
            ['white', 'WHITE'],
            ['gray', 'GRAY'],
            ['black', 'BLACK'],
            ['red', 'RED'],
            ['green', 'GREEN'],
            ['blue', 'BLUE'],
            ['cyan', 'CYAN'],
            ['magenta', 'MAGENTA'],
            ['yellow', 'YELLOW'],
            ['transparentBlack', 'TRANSPARENT_BLACK'],
            ['luminosityGamma', 'LUMINOSITY_GAMMA'],
            ['luminosityLinear', 'LUMINOSITY_LINEAR']
        ]);
        setOperatorFlags(OperatorFlags.all ^ OperatorFlags.div);

        addMethod(()=> {
            setMethodReturn('unsigned');
        }, 'ToUInt');
        addMethod(()=> {
            setMethodArgs(['unsigned']);
        }, 'FromUInt');
        addMethod(()=> {
            setMethodArgs(['float', 'float', 'float', 'float']);
        }, 'FromHSL');
        addMethod(()=> {
            setMethodArgs(['float', 'float', 'float', 'float']);
        }, 'FromHSV');
        addMethod(()=> {
            setMethodReturn('float');
        }, 'SumRGB');
        addMethod(()=>{
            setMethodReturn('float');
        }, 'Average');
        addMethod(()=> {
            setMethodReturn('float');
        }, 'Luma');
        addMethod(()=> {
            setMethodReturn('float');
        }, 'Chroma');
        addMethod(()=> {
            setMethodReturn('float');
        }, 'Hue');
        addMethod(()=> {
            setMethodReturn('float');
        }, 'SaturationHSL');
        addMethod(()=> {
            setMethodReturn('float');
        }, 'SaturationHSV');
        addMethod(()=> {
            setMethodReturn('float');
        }, 'Value');
        addMethod(()=> {
            setMethodReturn('Color');
        },'GammaToLinear');
        addMethod(()=> {
            setMethodReturn('Color');
        },'LinearToGamma');
        addMethod(()=> {
            setMethodReturn('float');
        },'Lightness');
        addMethod(()=> {
            setMethodReturn('float');
        },'MaxRGB');
        addMethod(()=> {
            setMethodReturn('float');
        },'MinRGB');
        addMethod(()=> {
            setMethodReturn('float');
        },'Range');
        addMethod(()=> {
            setMethodArgs(['bool']);
        },'Clip');
        addMethod(()=> {
            setMethodArgs(['bool']);
        },'Invert');
        addMethod(()=> {
            setMethodArgs(['Color', 'float']);
            setMethodReturn('Color');
        },'Lerp');
        addMethod(()=> {
            setMethodReturn('Color');
        },'Abs');
        addMethod(()=> {
            setMethodReturn('unsigned');
        },'ToUIntArgb');
        addMethod(()=> {
            setMethodReturn('unsigned');
        },'ToHash');
    }, "Color");
}