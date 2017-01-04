class TypeRenderer {
  constructor(native, wrapped) {
    this.nativeType = native;
    this.wrappedType = wrapped;
    this.nativeTypeDecl = native.name;
    this.convertFunction = `Util::ConvertWrappedValue<${native.name}>`;
  }

  toNative(resVar, inVar, failClause) {
    return `\
      ${this.nativeTypeDecl} ${resVar};
      if(!${this.convertFunction}(${inVar}, ${resVar})){
        ${failClause}
      }`;
  }

  toJs() {
    throw new Error('toJs function not implemented');
  }
}

class WrappedTypeRenderer extends TypeRenderer {
  toJs(inVar) {
    return `${this.wrappedType.qualifiedName}::BuildWrapper((void *) &${inVar});`;
  }
}

class WrappedTransientTypeRenderer extends WrappedTypeRenderer {
  constructor(native, wrapped) {
    super(native, wrapped);
    this.nativeTypeDecl = `opencascade::handle<${native.name}>`;
    this.convertFunction = `Util::ConvertWrappedTransientValue<${native.name}>`;
  }

}

class NativeTypeRenderer extends TypeRenderer {
  toJs(inVar) {
    return `Nan::New(${inVar});`;
  }
}
