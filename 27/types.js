"use strict";
/**
 * 类型体系
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.TypeVisitor = exports.SysTypes = exports.IntersectionType = exports.UnionType = exports.FunctionType = exports.ValueType = exports.ComplementNamedType = exports.NamedType = exports.Type = exports.TypeUtil = exports.TypeKind = void 0;
var TypeKind;
(function (TypeKind) {
    TypeKind[TypeKind["Named"] = 0] = "Named";
    TypeKind[TypeKind["Value"] = 1] = "Value";
    TypeKind[TypeKind["Union"] = 2] = "Union";
    TypeKind[TypeKind["Intersection"] = 3] = "Intersection";
    TypeKind[TypeKind["Function"] = 4] = "Function";
    TypeKind[TypeKind["ComplementNamed"] = 5] = "ComplementNamed";
})(TypeKind = exports.TypeKind || (exports.TypeKind = {}));
;
class TypeUtil {
    //t1是否是t2的子类型
    //LE是less equal的意思，也就是t1的值域是t2的值域的子集
    //LE采用的是比较悲观的算法，如果返回值为true，t1肯定是t2的子集；如果不肯定，就返回false
    static LE(t1, t2) {
        //短路
        if (t1 == t2 || t2 == SysTypes.Any || TypeUtil.isEmpty(t1)) {
            return true;
        }
        let rtn = false;
        switch (t1.kind) {
            case TypeKind.Named:
                switch (t2.kind) {
                    case TypeKind.Named:
                        rtn = TypeUtil.LE_N_N(t1, t2);
                        break;
                    case TypeKind.ComplementNamed:
                        rtn = TypeUtil.LE_N_CN(t1, t2);
                        break;
                    case TypeKind.Value:
                        rtn = TypeUtil.LE_N_V(t1, t2);
                        break;
                    case TypeKind.Union:
                        rtn = TypeUtil.LE_T_U(t1, t2);
                        break;
                    case TypeKind.Intersection:
                        rtn = TypeUtil.LE_T_I(t1, t2);
                        break;
                }
                break;
            case TypeKind.ComplementNamed:
                switch (t2.kind) {
                    case TypeKind.Named:
                        rtn = TypeUtil.LE_CN_N(t1, t2);
                        break;
                    case TypeKind.ComplementNamed:
                        rtn = TypeUtil.LE_CN_CN(t1, t2);
                        break;
                    case TypeKind.Value:
                        rtn = TypeUtil.LE_CN_V(t1, t2);
                        break;
                    case TypeKind.Union:
                        rtn = TypeUtil.LE_T_U(t1, t2);
                        break;
                    case TypeKind.Intersection:
                        rtn = TypeUtil.LE_T_I(t1, t2);
                        break;
                }
                break;
            case TypeKind.Value:
                switch (t2.kind) {
                    case TypeKind.Named:
                        rtn = TypeUtil.LE_V_N(t1, t2);
                        break;
                    case TypeKind.ComplementNamed:
                        rtn = TypeUtil.LE_V_CN(t1, t2);
                        break;
                    case TypeKind.Value:
                        rtn = TypeUtil.LE_V_V(t1, t2);
                        break;
                    case TypeKind.Union:
                        rtn = TypeUtil.LE_T_U(t1, t2);
                        break;
                    case TypeKind.Intersection:
                        rtn = TypeUtil.LE_T_I(t1, t2);
                        break;
                }
                break;
            case TypeKind.Union:
                rtn = TypeUtil.LE_U_T(t1, t2);
                break;
            case TypeKind.Intersection:
                rtn = TypeUtil.LE_I_T(t1, t2);
                break;
        }
        return rtn;
    }
    static LE_N_N(t1, t2) {
        if (t1.upperTypes.indexOf(t2) != -1) {
            return true;
        }
        else {
            //看看所有的父类型中，有没有一个是t2的子类型
            for (let upperType of t1.upperTypes) {
                if (TypeUtil.LE(upperType, t2)) {
                    return true;
                }
            }
            return false;
        }
    }
    static LE_N_CN(t1, t2) {
        return t1 === SysTypes.Never || t2.namedType === SysTypes.Never; //空集的补集是全集
    }
    static LE_N_V(t1, t2) {
        if (t2.isComplement) {
            return t1 === SysTypes.Never || !TypeUtil.LE_N_N(t1, t2.typeOfValue) && !TypeUtil.LE_N_N(t2.typeOfValue, t1);
        }
        else {
            return false;
        }
    }
    static LE_CN_N(t1, t2) {
        return t1.namedType === SysTypes.Any || t2 === SysTypes.Any;
    }
    static LE_CN_CN(t1, t2) {
        return TypeUtil.LE_N_N(t2.namedType, t1.namedType);
    }
    static LE_CN_V(t1, t2) {
        if (!t2.isComplement) {
            return t1.namedType === SysTypes.Any || t2.typeOfValue === SysTypes.Any;
        }
        else {
            return TypeUtil.LE(t2.typeOfValue, t1.namedType);
        }
    }
    static LE_V_N(t1, t2) {
        if (!t1.isComplement) {
            return TypeUtil.LE_N_N(t1.typeOfValue, t2);
        }
        else {
            return t2 === SysTypes.Any;
        }
    }
    static LE_V_CN(t1, t2) {
        if (!t1.isComplement) {
            //t1的类型和t2.nameOfType没有交集   
            return !TypeUtil.LE_N_N(t1.typeOfValue, t2.namedType) && !TypeUtil.LE_N_N(t2.namedType, t1.typeOfValue);
        }
        else {
            return t1.typeOfValue === SysTypes.Never;
        }
    }
    static LE_V_V(t1, t2) {
        if (t1.value == t2.value) {
            //两个值相等
            return (t1.isComplement && t2.isComplement || !t1.isComplement && !t2.isComplement);
        }
        else if (!t1.isComplement && t2.isComplement) {
            return true;
        }
        else {
            return false;
        }
    }
    static LE_T_U(t1, t2) {
        for (let t3 of t2.types) {
            if (TypeUtil.LE(t1, t3)) {
                return true;
            }
        }
        return false;
    }
    static LE_U_T(t1, t2) {
        for (let t3 of t1.types) {
            if (!TypeUtil.LE(t3, t2)) {
                return false;
            }
        }
        return true;
    }
    static LE_T_I(t1, t2) {
        return false;
    }
    //交集中的一个元素<=t2，那么整个交集一定<=t2
    static LE_I_T(t1, t2) {
        for (let t3 of t1.types) {
            if (TypeUtil.LE(t3, t2)) {
                return true;
            }
        }
        return false;
    }
    //是否是空集
    static isEmpty(t) {
        return t === SysTypes.Never ||
            t.kind == TypeKind.Value && t.typeOfValue == SysTypes.Any && t.isComplement ||
            t.kind == TypeKind.Union && t.types.length == 0 ||
            t.kind == TypeKind.Intersection && t.types.length == 0;
    }
    /**
     * 判断两个类型是否有交集
     * @param t1
     * @param t2
     */
    static overlap(t1, t2) {
        //短路
        if (TypeUtil.isEmpty(t1) || TypeUtil.isEmpty(t2)) {
            return false;
        }
        else if (t1 === SysTypes.Any || t2 === SysTypes.Any) {
            return true;
        }
        else if (t1 === t2) {
            return true;
        }
        let rtn = false;
        switch (t1.kind) {
            case TypeKind.Named:
                switch (t2.kind) {
                    case TypeKind.Named:
                        rtn = TypeUtil.overlap_N_N(t1, t2);
                        break;
                    case TypeKind.ComplementNamed:
                        rtn = TypeUtil.overlap_N_CN(t1, t2);
                        break;
                    case TypeKind.Value:
                        rtn = TypeUtil.overlap_N_V(t1, t2);
                        break;
                    case TypeKind.Union:
                        rtn = TypeUtil.overlap_U_T(t2, t1);
                        break;
                    case TypeKind.Intersection:
                        rtn = TypeUtil.overlap_I_T(t2, t1);
                        break;
                }
                break;
            case TypeKind.ComplementNamed:
                switch (t2.kind) {
                    case TypeKind.Named:
                        rtn = TypeUtil.overlap_N_CN(t2, t1);
                        break;
                    case TypeKind.ComplementNamed:
                        rtn = TypeUtil.overlap_CN_CN(t1, t2);
                        break;
                    case TypeKind.Value:
                        rtn = TypeUtil.overlap_CN_V(t1, t2);
                        break;
                    case TypeKind.Union:
                        rtn = TypeUtil.overlap_U_T(t2, t1);
                        break;
                    case TypeKind.Intersection:
                        rtn = TypeUtil.overlap_I_T(t2, t1);
                        break;
                }
                break;
            case TypeKind.Value:
                switch (t2.kind) {
                    case TypeKind.Named:
                        rtn = TypeUtil.overlap_N_V(t2, t1);
                        break;
                    case TypeKind.ComplementNamed:
                        rtn = TypeUtil.overlap_CN_V(t2, t1);
                        break;
                    case TypeKind.Value:
                        rtn = TypeUtil.overlap_V_V(t1, t2);
                        break;
                    case TypeKind.Union:
                        rtn = TypeUtil.overlap_U_T(t2, t1);
                        break;
                    case TypeKind.Intersection:
                        rtn = TypeUtil.overlap_I_T(t2, t1);
                        break;
                }
                break;
            case TypeKind.Union:
                rtn = TypeUtil.overlap_U_T(t1, t2);
                break;
            case TypeKind.Intersection:
                rtn = TypeUtil.overlap_I_T(t1, t2);
                break;
        }
        return rtn;
    }
    static overlap_N_N(t1, t2) {
        return TypeUtil.LE_N_N(t1, t2) || TypeUtil.LE_N_N(t2, t1);
    }
    static overlap_N_CN(t1, t2) {
        return !TypeUtil.LE(t1, t2.namedType);
    }
    static overlap_N_V(t1, t2) {
        return (TypeUtil.LE(t2.typeOfValue, t1));
    }
    static overlap_CN_CN(t1, t2) {
        //没有空集
        return t1.namedType !== SysTypes.Any && t2.namedType !== SysTypes.Any;
    }
    static overlap_CN_V(t1, t2) {
        return !TypeUtil.LE(t2.typeOfValue, t1.namedType);
    }
    static overlap_V_V(t1, t2) {
        if (t1.isComplement) {
            if (t2.isComplement) {
                return true; //都是补集，无法比较，就认为有重叠好了。
            }
            else {
                //两者恰好互为补集，就返回false。
                return t1.value != t2.value;
            }
        }
        else { //!t1.isComplement
            if (t2.isComplement) {
                return t1.value != t2.value;
            }
            else {
                return t1.value == t2.value;
            }
        }
    }
    static overlap_U_T(t1, t2) {
        for (let t of t1.types) {
            if (TypeUtil.overlap(t, t2)) {
                return true;
            }
        }
        return false;
    }
    static overlap_I_T(t1, t2) {
        for (let t of t1.types) {
            if (!TypeUtil.overlap(t, t2)) {
                return false;
            }
        }
        return true;
    }
    /**
    * 求type1与type2的上界
    * @param t1
    * @param t2
    */
    static getUpperBound(t1, t2) {
        if (t1 == SysTypes.Any || t2 == SysTypes.Any) {
            return SysTypes.Any;
        }
        else {
            if (TypeUtil.LE(t1, t2)) {
                return t2;
            }
            else if (TypeUtil.LE(t2, t1)) {
                return t1;
            }
            else { //求并集
                return TypeUtil.unionTypes(t1, t2);
            }
        }
    }
    /**
     * 计算t1和t2的并集。
     * @param t1
     * @param t2
     */
    static unionTypes(t1, t2) {
        //短路
        if (TypeUtil.isEmpty(t1)) {
            return t2;
        }
        else if (TypeUtil.isEmpty(t2)) {
            return t1;
        }
        else if (t1 === SysTypes.Any || t2 === SysTypes.Any) {
            return SysTypes.Any;
        }
        let rtn = SysTypes.Any;
        switch (t1.kind) {
            case TypeKind.Named:
                switch (t2.kind) {
                    case TypeKind.Named:
                        rtn = TypeUtil.unionTypes_N_N(t1, t2);
                        break;
                    case TypeKind.ComplementNamed:
                        rtn = TypeUtil.unionTypes_N_CN(t1, t2);
                        break;
                    case TypeKind.Value:
                        rtn = TypeUtil.unionTypes_N_V(t1, t2);
                        break;
                    case TypeKind.Union:
                        rtn = TypeUtil.unionTypes_U_T(t2, t1);
                        break;
                    case TypeKind.Intersection:
                        rtn = TypeUtil.unionTypes_I_T(t2, t1);
                        break;
                }
                break;
            case TypeKind.ComplementNamed:
                switch (t2.kind) {
                    case TypeKind.Named:
                        rtn = TypeUtil.unionTypes_N_CN(t2, t1);
                        break;
                    case TypeKind.ComplementNamed:
                        rtn = TypeUtil.unionTypes_CN_CN(t1, t2);
                        break;
                    case TypeKind.Value:
                        rtn = TypeUtil.unionTypes_CN_V(t1, t2);
                        break;
                    case TypeKind.Union:
                        rtn = TypeUtil.unionTypes_U_T(t2, t1);
                        break;
                    case TypeKind.Intersection:
                        rtn = TypeUtil.unionTypes_I_T(t2, t1);
                        break;
                }
                break;
            case TypeKind.Value:
                switch (t2.kind) {
                    case TypeKind.Named:
                        rtn = TypeUtil.unionTypes_N_V(t2, t1);
                        break;
                    case TypeKind.ComplementNamed:
                        rtn = TypeUtil.unionTypes_CN_V(t2, t1);
                        break;
                    case TypeKind.Value:
                        rtn = TypeUtil.unionTypes_V_V(t1, t2);
                        break;
                    case TypeKind.Union:
                        rtn = TypeUtil.unionTypes_U_T(t2, t1);
                        break;
                    case TypeKind.Intersection:
                        rtn = TypeUtil.unionTypes_I_T(t2, t1);
                        break;
                }
                break;
            case TypeKind.Union:
                rtn = TypeUtil.unionTypes_U_T(t1, t2);
                break;
            case TypeKind.Intersection:
                rtn = TypeUtil.unionTypes_I_T(t1, t2);
                break;
        }
        return rtn;
    }
    static unionTypes_N_N(t1, t2) {
        let t;
        if (TypeUtil.LE(t1, t2)) {
            t = t2;
        }
        else if (TypeUtil.LE(t2, t1)) {
            t = t1;
        }
        else {
            t = new UnionType([t1, t2]);
        }
        return t;
    }
    static unionTypes_N_CN(t1, t2) {
        let t;
        if (TypeUtil.LE(t2, t1)) {
            t = SysTypes.Any;
        }
        else if (t1 === SysTypes.Never) {
            t = t2;
        }
        else {
            t = new UnionType([t1, t2]);
        }
        return t;
    }
    static unionTypes_CN_CN(t1, t2) {
        let t;
        if (TypeUtil.LE(t2.namedType, t1.namedType)) {
            t = t2;
        }
        else if (TypeUtil.LE(t1.namedType, t2.namedType)) {
            t = t1;
        }
        else {
            t = new UnionType([t1, t2]);
        }
        return t;
    }
    static unionTypes_N_V(t1, t2) {
        let t;
        if (TypeUtil.LE(t2.typeOfValue, t1)) {
            t = t1;
        }
        else {
            t = new UnionType([t1, t2]);
        }
        return t;
    }
    static unionTypes_CN_V(t1, t2) {
        let t;
        if (!TypeUtil.overlap(t2.typeOfValue, t1.namedType)) {
            t = t1;
        }
        else {
            t = new UnionType([t1, t2]);
        }
        return t;
    }
    /**
     * 返回两个ValueSet的并集
     * 规则：
     * 如果都是常规集合，那么也返回一个常规集合。
     * 否则，都是返回补集。
     * @param t1
     * @param t2
     */
    static unionTypes_V_V(t1, t2) {
        if (t1.value == t2.value) {
            if (t1.isComplement != t2.isComplement) {
                return SysTypes.Any; //全集
            }
            else {
                return t1;
            }
        }
        else {
            return new UnionType([t1, t2]);
        }
    }
    static unionTypes_U_T(t1, t2) {
        let types = [];
        for (let t of t1.types) {
            let t3 = TypeUtil.unionTypes(t, t2);
            if (t3.kind == TypeKind.Union) {
                types = types.concat(t3.types);
            }
            else {
                if (t3 === SysTypes.Any) {
                    return SysTypes.Any; //短路
                }
                else {
                    types.push(t3);
                }
            }
        }
        return TypeUtil.compressUnionType(new UnionType(types));
    }
    //把联合类型中可能的一些类型合并
    static compressUnionType(t) {
        //短路逻辑
        if (t.types.length == 0) {
            return SysTypes.Never;
        }
        else if (t.types.length == 1) {
            return t.types[0];
        }
        else if (t.types.indexOf(SysTypes.Any) != -1) {
            return SysTypes.Any;
        }
        let types = [];
        types.push(t.types[0]);
        for (let i = 1; i < t.types.length; i++) {
            let t1 = t.types[i];
            for (let t2 of types) {
                let t3 = TypeUtil.unionTypes(t1, t2);
                if (t3.kind == TypeKind.Union) { //没有被压缩
                    types.push(t1);
                }
                else if (t3 === SysTypes.Any) {
                    return SysTypes.Any;
                }
                else if (t3 != t2) { //把原来的值替换掉
                    types.splice(i, 1, t3);
                }
            }
        }
        return new UnionType(types);
    }
    static unionTypes_I_T(t1, t2) {
        if (TypeUtil.LE(t1, t2)) {
            return t2;
        }
        else if (TypeUtil.LE(t2, t1)) {
            return t1;
        }
        else if (t2.kind == TypeKind.Union) {
            let types = t2.types.slice(0); //克隆
            types.push(t1);
            return new UnionType(types);
        }
        else {
            return new UnionType([t1, t2]);
        }
    }
    /**
     * 计算t的补集。
     * @param t
     */
    static getComplementType(t) {
        let rtn;
        switch (t.kind) {
            case TypeKind.Value:
                let tv = t;
                rtn = new ValueType(tv.typeOfValue, tv.value, !tv.isComplement);
                break;
            case TypeKind.Named:
                rtn = new ComplementNamedType(t);
                break;
            case TypeKind.ComplementNamed:
                rtn = t.namedType;
                break;
            case TypeKind.Union:
            case TypeKind.Intersection:
                let types = [];
                for (let t2 of t.types) {
                    let t3 = TypeUtil.getComplementType(t2);
                    types.push(t3);
                }
                rtn = t.kind == TypeKind.Union ? new IntersectionType(types) : new UnionType(types);
                break;
            case TypeKind.Function:
                rtn = SysTypes.Never;
                break;
            default:
                const _exhaustiveCheck = t.kind;
                return _exhaustiveCheck;
        }
        return rtn;
    }
    /**
     * 计算t1和t2的交集
     * @param t1
     * @param t2
     */
    static intersectTypes(t1, t2) {
        //短路
        if (TypeUtil.isEmpty(t1) || TypeUtil.isEmpty(t2)) {
            return SysTypes.Never;
        }
        else if (t1 === SysTypes.Any) {
            return t2;
        }
        else if (t2 === SysTypes.Any) {
            return t1;
        }
        let rtn = SysTypes.Any;
        switch (t1.kind) {
            case TypeKind.Named:
                switch (t2.kind) {
                    case TypeKind.Named:
                        rtn = TypeUtil.intersectTypes_N_N(t1, t2);
                        break;
                    case TypeKind.ComplementNamed:
                        rtn = TypeUtil.intersectTypes_N_CN(t1, t2);
                        break;
                    case TypeKind.Value:
                        rtn = TypeUtil.intersectTypes_N_V(t1, t2);
                        break;
                    case TypeKind.Union:
                        rtn = TypeUtil.intersectTypes_U_T(t2, t1);
                        break;
                    case TypeKind.Intersection:
                        rtn = TypeUtil.intersectTypes_I_T(t2, t1);
                        break;
                }
                break;
            case TypeKind.ComplementNamed:
                switch (t2.kind) {
                    case TypeKind.Named:
                        rtn = TypeUtil.intersectTypes_N_CN(t2, t1);
                        break;
                    case TypeKind.ComplementNamed:
                        rtn = TypeUtil.intersectTypes_CN_CN(t1, t2);
                        break;
                    case TypeKind.Value:
                        rtn = TypeUtil.intersectTypes_CN_V(t1, t2);
                        break;
                    case TypeKind.Union:
                        rtn = TypeUtil.intersectTypes_U_T(t2, t1);
                        break;
                    case TypeKind.Intersection:
                        rtn = TypeUtil.intersectTypes_I_T(t2, t1);
                        break;
                }
                break;
            case TypeKind.Value:
                switch (t2.kind) {
                    case TypeKind.Named:
                        rtn = TypeUtil.intersectTypes_N_V(t2, t1);
                        break;
                    case TypeKind.ComplementNamed:
                        rtn = TypeUtil.intersectTypes_CN_V(t2, t1);
                        break;
                    case TypeKind.Value:
                        rtn = TypeUtil.intersectTypes_V_V(t1, t2);
                        break;
                    case TypeKind.Union:
                        rtn = TypeUtil.intersectTypes_U_T(t2, t1);
                        break;
                    case TypeKind.Intersection:
                        rtn = TypeUtil.intersectTypes_I_T(t2, t1);
                        break;
                }
                break;
            case TypeKind.Union:
                rtn = TypeUtil.intersectTypes_U_T(t1, t2);
                break;
            case TypeKind.Intersection:
                rtn = TypeUtil.intersectTypes_I_T(t1, t2);
                break;
        }
        return rtn;
    }
    //对于两个NamedType，返回子类型
    static intersectTypes_N_N(t1, t2) {
        if (TypeUtil.LE(t1, t2)) {
            return t1;
        }
        else if (TypeUtil.LE(t2, t1)) {
            return t2;
        }
        else {
            return SysTypes.Never; //空集
        }
    }
    static intersectTypes_N_CN(t1, t2) {
        if (TypeUtil.LE(t1, t2.namedType)) {
            return SysTypes.Never;
        }
        else {
            return new IntersectionType([t1, t2]);
        }
    }
    static intersectTypes_N_V(t1, t2) {
        // console.log("\nintersectTypes_N_V");
        // console.log("t1: " + t1.toString()+ ", " + TypeKind[t1.kind]);
        // console.log("t2: "+ t2.toString()+ ", " + TypeKind[t2.kind]);
        let rtn;
        if (!t2.isComplement) {
            if (TypeUtil.LE(t2.typeOfValue, t1)) {
                rtn = t2;
            }
            else if (!TypeUtil.LE(t2.typeOfValue, t1) && !TypeUtil.LE(t1, t2.typeOfValue)) {
                rtn = SysTypes.Never;
            }
            else {
                rtn = new IntersectionType([t1, t2]);
            }
        }
        else { //t2.isComplement 
            rtn = new IntersectionType([t1, t2]);
        }
        // console.log("\nrtn of intersectTypes_N_V: "+rtn.toString()+ ", " + TypeKind[rtn.kind]);
        return rtn;
    }
    static intersectTypes_CN_CN(t1, t2) {
        if (TypeUtil.LE(t1.namedType, t2.namedType)) {
            return t1;
        }
        else if (TypeUtil.LE(t2.namedType, t1.namedType)) {
            return t2;
        }
        else {
            return new IntersectionType([t1, t2]);
        }
    }
    static intersectTypes_CN_V(t1, t2) {
        if (t2.isComplement) {
            if (TypeUtil.LE(t2.typeOfValue, t1.namedType)) {
                return t2;
            }
            else {
                return new IntersectionType([t1, t2]);
            }
        }
        else { //!t2.isComplement
            if (TypeUtil.LE(t2.typeOfValue, t1.namedType)) {
                return SysTypes.Never;
            }
            else if (!TypeUtil.LE(t2.typeOfValue, t1) && !TypeUtil.LE(t1, t2.typeOfValue)) {
                return t2;
            }
            else {
                return new IntersectionType([t1, t2]);
            }
        }
    }
    static intersectTypes_V_V(t1, t2) {
        if (t1.value == t2.value) {
            if (t1.isComplement && t2.isComplement || !t1.isComplement && !t2.isComplement) {
                return t1;
            }
            else {
                return SysTypes.Never;
            }
        }
        else {
            if (t1.isComplement && !t2.isComplement) {
                return t2;
            }
            else if (!t1.isComplement && t2.isComplement) {
                return t1;
            }
            else {
                return new IntersectionType([t1, t2]);
            }
        }
    }
    static intersectTypes_I_T(t1, t2) {
        // console.log("\nintersectTypes_I_T");
        // console.log("t1: " + t1.toString()+ ", " + TypeKind[t1.kind]);
        // console.log("t2: "+ t2.toString()+ ", " + TypeKind[t2.kind]);
        let types = [];
        for (let t of t1.types) {
            let t3 = TypeUtil.intersectTypes(t, t2);
            // console.log("t3: "+t3.toString() + ", " + TypeKind[t3.kind]);
            if (t3.kind == TypeKind.Intersection) {
                types = types.concat(t3.types);
            }
            else {
                if (t3 === SysTypes.Never) {
                    return t3; //短路
                }
                else {
                    types.push(t3);
                }
            }
        }
        let rtn = new IntersectionType(types);
        rtn = TypeUtil.compressIntersectionType(rtn);
        // console.log("\nrtn of intersectTypes_I_T: "+rtn.toString()+ ", " + TypeKind[rtn.kind]);
        return rtn;
    }
    //把联合类型中可能的一些类型合并
    static compressIntersectionType(t) {
        //短路逻辑
        if (t.types.length == 0) {
            return SysTypes.Never;
        }
        else if (t.types.length == 1) {
            return t.types[0];
        }
        else if (t.types.indexOf(SysTypes.Never) != -1) {
            return SysTypes.Never;
        }
        let types = [];
        types.push(t.types[0]);
        for (let i = 1; i < t.types.length; i++) {
            let t1 = t.types[i];
            let duplicate = false;
            for (let t2 of types) { //todo 只是做去重和监测补集是OK的吗？
                //去重
                if (TypeUtil.isSame(t1, t2)) {
                    duplicate = true;
                    break;
                }
                //检测补集
                let t3 = TypeUtil.intersectTypes(t1, t2);
                if (t3 == SysTypes.Never) {
                    return SysTypes.Never; //短路，直接返回
                }
            }
            if (!duplicate)
                types.push(t1);
        }
        return TypeUtil.normalizedIntersectionType(types);
    }
    static intersectTypes_U_T(t1, t2) {
        // console.log("\nintersectTypes_U_T");
        // console.log("t1: " + t1.toString());
        // console.log("t2: "+ t2.toString());
        let rtn;
        if (TypeUtil.LE(t1, t2)) {
            rtn = t1;
        }
        else if (TypeUtil.LE(t2, t1)) {
            rtn = t2;
        }
        else if (t2.kind == TypeKind.Value || t2.kind == TypeKind.Named || t2.kind == TypeKind.ComplementNamed) {
            let t3 = TypeUtil.getComplementType(t2);
            let index = -1;
            for (let i = 0; i < t1.types.length; i++) {
                if (TypeUtil.isSame(t1.types[i], t3)) {
                    index = i;
                    break;
                }
            }
            if (index != -1) {
                let types = t1.types.slice(0); //克隆
                types.splice(index, 1); //去掉相补的元素
                rtn = this.normalizedUnionType(types);
            }
        }
        else if (t2 instanceof UnionType) {
            let types2 = [];
            for (let t3 of t2.types) {
                let t4 = TypeUtil.intersectTypes(t1, t3);
                if (t4 != SysTypes.Never)
                    types2.push(t4);
            }
            rtn = TypeUtil.normalizedUnionType(types2);
        }
        else if (t2.kind == TypeKind.Intersection) {
            // let types = (t2 as IntersectionType).types.slice(0);  //克隆
            // types.push(t1);
            // return new IntersectionType(types);
            let types2 = [];
            for (let t3 of t1.types) {
                let t4 = TypeUtil.intersectTypes(t2, t3);
                if (t4 !== SysTypes.Never)
                    types2.push(t4);
            }
            rtn = TypeUtil.normalizedUnionType(types2);
        }
        if (!rtn)
            rtn = new IntersectionType([t1, t2]);
        // console.log("\nrtn of intersectTypes_U_T: "+rtn.toString()+ ", " + TypeKind[rtn.kind]);
        return rtn;
    }
    static normalizedUnionType(types) {
        if (types.length == 0) {
            return SysTypes.Never;
        }
        else if (types.length == 1) {
            return types[0];
        }
        else {
            return new UnionType(types);
        }
    }
    static normalizedIntersectionType(types) {
        if (types.length == 0) {
            return SysTypes.Never;
        }
        else if (types.length == 1) {
            return types[0];
        }
        else {
            return new IntersectionType(types);
        }
    }
    //把一个类型数组中的类型尽量合并
    //要求types不能是空数组
    static mergeTypes(types) {
        if (types.length == 1) {
            return types[0];
        }
        else { //把求所有这些结果的并集
            let t = types[0];
            for (let i = 1; i < types.length; i++) {
                t = TypeUtil.unionTypes(t, types[i]);
            }
            return t;
        }
    }
    //根据值来创建类型
    static createTypeByValue(v) {
        let t = TypeUtil.getNamedTypeByValue(v);
        return new ValueType(t, v, false);
    }
    static getNamedTypeByValue(v) {
        if (typeof v == 'number') {
            if (Number.isInteger(v)) {
                return SysTypes.Integer;
            }
            else {
                return SysTypes.Decimal;
            }
        }
        else if (typeof v == 'boolean') {
            return SysTypes.Boolean;
        }
        else if (typeof v == 'string') {
            return SysTypes.String;
        }
        else if (typeof v == 'object') {
            return SysTypes.Object;
        }
        else { // typeof v == 'undefined'
            return SysTypes.UndefinedType;
        }
    }
    static getNamedType(str) {
        let t;
        switch (str) {
            case 'number':
                t = SysTypes.Number;
                break;
            case 'string':
                t = SysTypes.String;
                break;
            case 'boolean':
                t = SysTypes.Boolean;
                break;
            case 'object':
                t = SysTypes.Object;
                break;
            case 'undefined':
                t = SysTypes.UndefinedType;
                break;
            default:
                t = SysTypes.Never;
        }
        return t;
    }
    /**
     * 类型是否可以用来做> >= < <=运算
     * @param t
     */
    static isComparable(t) {
        let rtn = false;
        switch (t.kind) {
            case TypeKind.Named:
                rtn = TypeUtil.LE(t, SysTypes.Number) || t === SysTypes.Boolean || t === SysTypes.String;
                break;
            case TypeKind.Value:
                rtn = TypeUtil.isComparable(t.typeOfValue);
                break;
            case TypeKind.Union:
            case TypeKind.Intersection:
                rtn = true;
                for (let t2 of t.types) {
                    if (!TypeUtil.isComparable(t2)) {
                        rtn = false;
                        break;
                    }
                }
                break;
        }
        return rtn;
    }
    //比较两个Type对象是否相等。
    static isSame(t1, t2) {
        if (t1 === t2) {
            return true;
        }
        else if (t1.kind != t2.kind) {
            return false;
        }
        else if (t1.kind == TypeKind.Value) {
            let t1v = t1;
            let t2v = t2;
            return t1v.value == t2v.value;
        }
        else if (t1.kind == TypeKind.ComplementNamed) {
            return this.isSame(t1.namedType, t2.namedType);
        }
        //todo 。。。
        return false;
    }
    /**
     * 返回最佳的公共类型。把值类型合并。
     * 比如：
     * 0|1|null的最佳公共类型是number|null。
     * 0|1|“hello”的最佳公共类型是number|string.
     * 该函数主要用于做类型推导。
     * @param t
     */
    static getBestCommonType(t) {
        let theType = SysTypes.Never;
        if (t instanceof NamedType) {
            theType = t;
        }
        if (t instanceof ValueType) {
            if (t !== SysTypes.Null || t !== SysTypes.Undefined) { //null和undefined不需要改变
                theType = t.typeOfValue;
            }
        }
        else if (t instanceof ComplementNamedType) {
            theType = t;
        }
        else if (t instanceof UnionType || t instanceof IntersectionType) {
            let types = [];
            for (let t1 of t.types) {
                let t2 = TypeUtil.getBestCommonType(t1);
                if (t2 instanceof NamedType && types.indexOf(t2) == -1) {
                    types.push(t2);
                }
                else if (t2 instanceof ValueType) { //针对值类型的补集，互相抵销
                    let findSameValue = false;
                    for (let index = 0; index < types.length; index++) {
                        let t3 = types[index];
                        if (t3 instanceof ValueType && t3.value == t2.value) {
                            findSameValue = true;
                            if (t3.isComplement != t2.isComplement) {
                                types.splice(index, 1);
                            }
                            break;
                        }
                    }
                    if (!findSameValue)
                        types.push(t2);
                }
                else if (t2 instanceof ComplementNamedType) { //针对补集，互相抵销
                    let index = types.indexOf(t2.namedType);
                    if (index != -1) {
                        types.splice(index, 1); //删除原来的NamedType
                    }
                }
                else {
                    types.push(t2);
                }
            }
            theType = (t instanceof UnionType) ? TypeUtil.normalizedUnionType(types) : TypeUtil.normalizedIntersectionType(types);
        }
        return theType;
    }
    /**
     * 基于变量原来的类型，得到真值判断的条件。
     * 比如，原来的变量a是number|null型的，那么if(a)形成的Narrowing条件是：
     * !0 & !null。
     * @param t
     */
    static getTruethfulConditions(t) {
        let types = TypeUtil.getNamedTypes(t);
        let types2 = [];
        //如果存在Any类型，那么就把所有false值都加进去。
        if (types.indexOf(SysTypes.Any) != -1) {
            types2.push(new ValueType(SysTypes.String, "", true));
            types2.push(new ValueType(SysTypes.Boolean, false, true));
            types2.push(new ValueType(SysTypes.Number, 0, true));
            types2.push(new ValueType(SysTypes.Object, null, true));
            types2.push(new ValueType(SysTypes.UndefinedType, undefined, true));
        }
        else {
            for (let t of types) {
                if (t instanceof ValueType) {
                    if (t.value == null) {
                        types2.push(new ValueType(SysTypes.Object, null, true));
                    }
                    else if (t.value == undefined) {
                        types2.push(new ValueType(SysTypes.UndefinedType, undefined, true));
                    }
                }
                else if (t instanceof NamedType) {
                    switch (t) {
                        case SysTypes.String:
                            types2.push(new ValueType(SysTypes.String, "", true));
                            break;
                        case SysTypes.Boolean:
                            types2.push(new ValueType(SysTypes.Boolean, false, true));
                            break;
                        case SysTypes.Number:
                        case SysTypes.Integer:
                        case SysTypes.Decimal:
                            types2.push(new ValueType(t, 0, true));
                            break;
                    }
                }
            }
        }
        return TypeUtil.normalizedIntersectionType(types2);
    }
    /**
     * 返回一个类型所涉及的基础类型，包括NamedType和Null、Undefined。
     * @param t
     */
    static getNamedTypes(t) {
        if (t instanceof NamedType) {
            return [t];
        }
        else if (t instanceof ValueType) {
            if (t.value === null || t.value === undefined) {
                return [t];
            }
            else {
                return [t.typeOfValue];
            }
        }
        else if (t instanceof ComplementNamedType) {
            return [t.namedType];
        }
        else if (t instanceof UnionType || t instanceof IntersectionType) {
            let types = [];
            for (let t1 of t.types) {
                let types1 = this.getNamedTypes(t1);
                types = types.concat(types1);
            }
            return types;
        }
        else {
            return [];
        }
    }
}
exports.TypeUtil = TypeUtil;
/**
 * 所有类型的基类。
 */
class Type {
    constructor(kind) {
        this.kind = kind;
    }
}
exports.Type = Type;
/**
 * 简单的类型，可以有一到多个父类型
 */
//todo: 需要检查循环引用
class NamedType extends Type {
    constructor(name, upperTypes = [], isComplement = false) {
        super(TypeKind.Named);
        this.name = name;
        this.upperTypes = upperTypes;
    }
    hasVoid() {
        if (this === SysTypes.Void) {
            return true;
        }
        else {
            for (let t of this.upperTypes) {
                if (t.hasVoid()) {
                    return true;
                }
            }
            return false;
        }
    }
    toString() {
        // let upperTypeNames:string = "[";
        // for (let ut of this.upperTypes){
        //     upperTypeNames += ut.name +", ";
        // }
        // upperTypeNames += "]";
        // return "SimpleType {name: " + this.name + ", upperTypes: " + upperTypeNames+ "}"; 
        return this.name;
    }
    /**
     * visitor模式
     */
    accept(visitor) {
        return visitor.visitNamedType(this);
    }
}
exports.NamedType = NamedType;
class ComplementNamedType extends Type {
    constructor(namedType) {
        super(TypeKind.Named);
        this.namedType = namedType;
    }
    hasVoid() {
        // if (this === SysTypes.Void){
        //     return true;
        // }
        // else{
        //     for (let t of this.upperTypes){
        //         if (t.hasVoid()){
        //             return true;
        //         }
        //     }
        //     return false;
        // }
        return true;
    }
    toString() {
        // let upperTypeNames:string = "[";
        // for (let ut of this.upperTypes){
        //     upperTypeNames += ut.name +", ";
        // }
        // upperTypeNames += "]";
        // return "SimpleType {name: " + this.name + ", upperTypes: " + upperTypeNames+ "}"; 
        return "!" + this.namedType.name;
    }
    /**
     * visitor模式
     */
    accept(visitor) {
        return visitor.visitComplmentNamedType(this);
    }
}
exports.ComplementNamedType = ComplementNamedType;
class ValueType extends Type {
    constructor(typeOfValue, value, isComplement = false) {
        super(TypeKind.Value);
        this.typeOfValue = typeOfValue;
        this.value = value;
        this.isComplement = isComplement;
    }
    toString() {
        let str = "" + this.value;
        if (typeof this.value === 'string')
            str = '"' + str + '"';
        return (this.isComplement ? "!" : "") + str;
    }
    hasVoid() {
        return false;
    }
    accept(visitor) {
        return visitor.visitValueSet(this);
    }
}
exports.ValueType = ValueType;
//todo: 需要检查循环引用
class FunctionType extends Type {
    constructor(returnType = SysTypes.Void, paramTypes = [], name = undefined) {
        super(TypeKind.Function);
        this.returnType = returnType;
        this.paramTypes = paramTypes;
    }
    hasVoid() {
        return this.returnType.hasVoid();
    }
    toString() {
        let str = "FunctionType: (";
        for (let i = 0; i < this.paramTypes.length; i++) {
            str += this.paramTypes[i].toString();
            if (i < this.paramTypes.length - 1)
                str += ", ";
        }
        return str + ")" + this.returnType.toString();
    }
    /**
     * 当前类型是否小于等于type2
     * @param type2
     */
    // LE(type2:Type):boolean{
    //     if (type2 == SysTypes.Any){
    //          return true;
    //     } 
    //     else if (this == type2){
    //         return true;
    //     }
    //     else if (type2.kind == TypeKind.Union){
    //         let t = type2 as UnionType;
    //         if (t.types.indexOf(this)!=-1){
    //             return true;
    //         }
    //         else{ 
    //             return false;
    //         }
    //     }
    //     else{
    //         return false;
    //     }
    // } 
    /**
     * visitor模式
     */
    accept(visitor) {
        return visitor.visitFunctionType(this);
    }
}
exports.FunctionType = FunctionType;
FunctionType.index = 0; //序号，用于给函数类型命名
//工具函数：链接多个类型的名称
function concatTypeNames(types, seperator) {
    let typeNames = "";
    for (let i = 0; i < types.length; i++) {
        let t = types[i];
        if (t instanceof UnionType || t instanceof IntersectionType) {
            typeNames += "(" + t.toString() + ")";
        }
        else {
            typeNames += t.toString();
        }
        if (i < types.length - 1)
            typeNames += " " + seperator + " ";
    }
    return typeNames;
}
//联合类型（类型的并集）
class UnionType extends Type {
    /**
     * TODO：该构造方法有个问题，如果types中的类型是互相有子类型关系，应该合并。
     * @param types
     */
    constructor(types) {
        super(TypeKind.Union);
        this.types = types;
    }
    hasVoid() {
        for (let t of this.types) {
            if (t.hasVoid()) {
                return true;
            }
        }
        return false;
    }
    toString() {
        let typeNames = concatTypeNames(this.types, "|");
        return typeNames;
    }
    /**
     * visitor模式
     */
    accept(visitor) {
        visitor.visitUnionType(this);
    }
}
exports.UnionType = UnionType;
//交集类型（也有人翻译作“交叉类型”）
class IntersectionType extends Type {
    /**
     * TODO：该构造方法有个问题，如果types中的类型是互相有子类型关系，应该合并。
     * @param types
     */
    constructor(types) {
        super(TypeKind.Intersection);
        this.types = types;
    }
    hasVoid() {
        for (let t of this.types) {
            if (!t.hasVoid()) {
                return false;
            }
        }
        return true;
    }
    toString() {
        let typeNames = concatTypeNames(this.types, "&");
        return typeNames;
    }
    /**
     * visitor模式
     */
    accept(visitor) {
        visitor.visitIntersectionType(this);
    }
}
exports.IntersectionType = IntersectionType;
/**
 * 内置类型
 */
class SysTypes {
    static isSysType(t) {
        return t === SysTypes.Any || t === SysTypes.String || t === SysTypes.Number ||
            t === SysTypes.Boolean || t === SysTypes.Null || t === SysTypes.Undefined ||
            t === SysTypes.Void || t === SysTypes.Integer || t === SysTypes.Decimal;
    }
}
exports.SysTypes = SysTypes;
//所有类型的父类型
SysTypes.Any = new NamedType("any", []);
//基础类型
SysTypes.String = new NamedType("string", [SysTypes.Any]);
SysTypes.Number = new NamedType("number", [SysTypes.Any]);
SysTypes.Boolean = new NamedType("boolean", [SysTypes.Any]);
SysTypes.Object = new NamedType("object", [SysTypes.Any]);
SysTypes.UndefinedType = new NamedType("undefined", [SysTypes.Any]);
//所有类型的子类型
SysTypes.Null = new ValueType(SysTypes.Object, null);
SysTypes.Undefined = new ValueType(SysTypes.UndefinedType, undefined);
//函数没有任何返回值的情况
//如果作为变量的类型，则智能赋值为null和undefined
SysTypes.Void = new NamedType("void");
//Bottom类型
SysTypes.Never = new NamedType("never");
//两个Number的子类型
SysTypes.Integer = new NamedType("integer", [SysTypes.Number]);
SysTypes.Decimal = new NamedType("decimal", [SysTypes.Number]);
/**
 * visitor
 */
class TypeVisitor {
    visit(t) {
        return t.accept(this);
    }
}
exports.TypeVisitor = TypeVisitor;
