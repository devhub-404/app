import { registerDecorator, ValidationArguments, ValidationOptions } from 'class-validator';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function IsUUID(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isUUID',
      target: object.constructor,
      propertyName,
      ...(validationOptions ? { options: validationOptions } : {}),
      validator: {
        validate(value: unknown) {
          return typeof value === 'string' && UUID_RE.test(value);
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} deve ser um ID válido`;
        },
      },
    });
  };
}
