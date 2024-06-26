/**
 * Copyright (c) DragonSpark 2024
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this repository.
 *
 * May your code be mighty and your dragons ever fierce.
 */

import { defineType, makeInvocableDefinition } from './defineType';
import {
  arrayOf,
  assertAny,
  assertOneOf,
  assertType,
  assertValueType
} from './assert';

//-------------------------------------------------------------------------------
// Comments
//-------------------------------------------------------------------------------
export const Comment = defineType('Comment', {
  fields: {
    value: {
      validate: assertValueType('string')
    }
  },
  generate(printer, node) {
    if (node.value === '' || node.value === undefined || node.value === null) {
      return;
    }

    const lines = node.value.split('\n');
    for (let i = 0; i < lines.length; i++) {
      printer.token('// ');
      printer.token(lines[i]);
      if (i !== lines.length - 1) {
        printer.newline();
      }
    }
  }
});

//-------------------------------------------------------------------------------
// Identifier
//-------------------------------------------------------------------------------
export const Identifier = defineType('Identifier', {
  fields: {
    name: {
      validate: assertValueType('string')
    }
  },
  generate(printer, node, parent) {
    if (
      parent &&
      (parent.type === Assignment.type ||
        parent.type === AssignmentPattern.type ||
        parent.type === CallExpression.type ||
        parent.type === LogicalExpression.type ||
        parent.type === SassMixin.type ||
        parent.type === SassList.type ||
        parent.type === RestPattern.type ||
        parent.type === SassFunction.type)
    ) {
      printer.token('$');
    }
    printer.token(node.name);
  }
});

//-------------------------------------------------------------------------------
// Blocks
//-------------------------------------------------------------------------------
export const BlockStatement = defineType('BlockStatement', {
  fields: {
    body: {
      validate: arrayOf(assertAny)
    }
  },
  generate(printer, node) {
    printer.blockStart();
    const nodeBody = node.body!;
    for (let i = 0; i < nodeBody.length; i++) {
      printer.print(nodeBody[i], node);
      if (i !== nodeBody.length - 1) {
        printer.newline();
      }
    }
    printer.blockEnd();
  }
});

//-------------------------------------------------------------------------------
// Values
//-------------------------------------------------------------------------------
export const SassBoolean = defineType('SassBoolean', {
  fields: {
    value: {
      validate: assertValueType('boolean')
    }
  },
  generate(printer, node) {
    printer.token(node.value);
  }
});

export const SassColor = defineType('SassColor', {
  fields: {
    value: {
      validate: assertValueType('string')
    }
  },
  generate(printer, node) {
    printer.token(node.value);
  }
});

export const SassFunction = defineType('SassFunction', {
  fields: {
    id: {
      validate: assertType(Identifier)
    },
    params: {
      optional: true,
      validate: () =>
        arrayOf(
          assertOneOf([assertType(AssignmentPattern), assertType(Identifier)])
        )
    },
    body: {
      validate: () => assertType(BlockStatement)
    }
  },
  generate(printer, node, parent) {
    printer.token('@function');
    printer.space();
    printer.print(node.id, parent);
    printer.token('(');

    if (Array.isArray(node.params)) {
      for (let i = 0; i < node.params.length; i++) {
        printer.print(node.params[i], node);
        if (i !== node.params.length - 1) {
          printer.token(',');
          printer.space();
        }
      }
    }

    printer.token(')');
    printer.space();
    printer.print(node.body, parent);
  }
});

export const SassList = defineType('SassList', {
  fields: {
    elements: {
      validate: () =>
        arrayOf(
          assertOneOf([
            assertType(SassBoolean),
            assertType(SassList),
            assertType(SassMap),
            assertType(SassNumber),
            assertType(SassString),
            assertType(Identifier)
          ])
        )
    }
  },
  generate(printer, node) {
    printer.token('(');
    const nodeElements = node.elements!;
    for (let i = 0; i < nodeElements.length; i++) {
      printer.print(nodeElements[i], node);
      if (i !== nodeElements.length - 1) {
        printer.token(',');
        printer.space();
      }
    }
    printer.token(')');
  }
});

export const SassMap = defineType('SassMap', {
  fields: {
    properties: {
      validate: () => arrayOf(assertType(SassMapProperty))
    }
  },
  generate(printer, node) {
    printer.blockStart('(');
    const nodeProperties = node.properties!;
    for (let i = 0; i < nodeProperties.length; i++) {
      printer.print(nodeProperties[i]);
      if (i !== nodeProperties.length - 1) {
        printer.token(',');
        printer.newline();
      }
    }
    printer.blockEnd(')');
  }
});

export const SassMapProperty = defineType('SassMapProperty', {
  fields: {
    key: {
      validate: assertType(Identifier)
    },
    value: {
      validate: () =>
        assertOneOf([SassBoolean, SassNumber, SassString, SassList, SassMap])
    },
    quoted: {
      optional: true,
      validate: assertValueType('boolean')
    }
  },
  generate(printer, node) {
    if (node.quoted) {
      printer.token(`'`);
      printer.print(node.key, node);
      printer.token(`'`);
    } else {
      printer.print(node.key, node);
    }
    printer.token(':');
    printer.space();
    printer.print(node.value, node);
  }
});

export const SassMixin = defineType('SassMixin', {
  fields: {
    id: {
      validate: assertType(Identifier)
    },
    params: {
      optional: true,
      validate: () =>
        arrayOf(
          assertOneOf([assertType(AssignmentPattern), assertType(Identifier)])
        )
    },
    body: {
      validate: assertType(BlockStatement)
    }
  },
  generate(printer, node, parent) {
    printer.token('@mixin');
    printer.space();
    printer.print(node.id, parent);
    printer.token('(');

    if (Array.isArray(node.params)) {
      for (let i = 0; i < node.params.length; i++) {
        printer.print(node.params[i], node);
        if (i !== node.params.length - 1) {
          printer.token(',');
          printer.space();
        }
      }
    }

    printer.token(')');
    printer.space();
    printer.print(node.body, parent);
  }
});

export const SassNumber = defineType('SassNumber', {
  fields: {
    value: {
      validate: assertValueType('number')
    }
  },
  generate(printer, node) {
    printer.token(node.value);
  }
});

export const SassString = defineType('SassString', {
  fields: {
    value: {
      validate: assertValueType('string')
    }
  },
  generate(printer, node) {
    printer.token(`'${node.value}'`);
  }
});

// Allow ability to short-circuit AST builder limitations and embed raw values
// into the Sass source code
export const SassValue = defineType('SassValue', {
  fields: {
    value: {
      validate: assertAny
    }
  },
  generate(printer, node) {
    printer.token(node.value);
  }
});

//-------------------------------------------------------------------------------
// Calls
//-------------------------------------------------------------------------------
export const SassFunctionCall = defineType('SassFunctionCall', {
  fields: {
    id: {
      validate: assertType(Identifier)
    },
    params: {
      optional: true,
      validate: () =>
        arrayOf(
          assertOneOf([
            assertType(Identifier),
            assertType(SassBoolean),
            assertType(SassList),
            assertType(SassMap),
            assertType(SassNumber),
            assertType(SassString),
            assertType(SassValue)
          ])
        )
    }
  },
  generate(printer, node) {
    printer.space();
    printer.print(node.id);
    printer.token('(');
    if (Array.isArray(node.params)) {
      for (let i = 0; i < node.params.length; i++) {
        const param = node.params[i];
        if (param.type === Identifier.type) {
          printer.token('$');
        }
        printer.print(param, node);
        if (i !== node.params.length - 1) {
          printer.token(',');
          printer.space();
        }
      }
    }
    printer.token(')');
  }
});

export const SassMixinCall = defineType('SassMixinCall', {
  fields: {
    id: {
      validate: assertType(Identifier)
    },
    params: {
      optional: true,
      validate: () =>
        arrayOf(
          assertOneOf([
            assertType(Identifier),
            assertType(SassBoolean),
            assertType(SassList),
            assertType(SassMap),
            assertType(SassNumber),
            assertType(SassString)
          ])
        )
    },
    body: {
      optional: true,
      validate: assertType(BlockStatement)
    }
  },
  generate(printer, node) {
    printer.token('@include');
    printer.space();
    printer.print(node.id);

    printer.token('(');
    if (Array.isArray(node.params)) {
      for (let i = 0; i < node.params.length; i++) {
        const param = node.params[i];

        if (param.type === Identifier.type) {
          printer.token('$');
        }

        printer.print(param, node);
        if (i !== node.params.length - 1) {
          printer.token(',');
          printer.space();
        }
      }
    }
    printer.token(')');

    if (node.body) {
      printer.print(node.body, node);
    }

    printer.token(';');
  }
});

//-------------------------------------------------------------------------------
// Rules
//-------------------------------------------------------------------------------
export const Rule = defineType('Rule', {
  fields: {
    declarations: {
      validate: () => arrayOf(assertType(Declaration))
    },
    selectors: {
      validate: arrayOf(assertValueType('string'))
    }
  },
  generate(printer, node) {
    printer.token(node.selectors?.join(', '));
    printer.space();
    printer.blockStart();

    const nodeDeclarations = node.declarations!;
    for (let i = 0; i < nodeDeclarations.length; i++) {
      const declaration = nodeDeclarations[i];

      printer.print(declaration, node);

      if (i !== nodeDeclarations.length - 1) {
        printer.newline();
      }
    }

    printer.blockEnd();
  }
});

export const Declaration = defineType('Declaration', {
  fields: {
    property: {
      validate: assertValueType('string')
    },
    value: {
      validate: () =>
        assertOneOf([assertValueType('string'), assertType(CallExpression)])
    }
  },
  generate(printer, node) {
    printer.token(node.property);
    printer.token(':');
    printer.space();
    if (typeof node.value === 'string') {
      printer.token(node.value);
    } else {
      printer.print(node.value);
    }
    printer.token(';');
  }
});

//-------------------------------------------------------------------------------
// At-Rules and directives
//-------------------------------------------------------------------------------
export const AtRule = defineType('AtRule', {
  fields: {
    name: {
      validate: assertValueType('string')
    },
    media: {
      validate: assertValueType('string')
    },
    children: {
      validate: arrayOf(assertOneOf([assertType(Rule)]))
    }
  },
  generate(printer, node) {
    printer.token(`@${node.name}`);
    printer.space();
    printer.token(node.media);
    printer.space();

    const nodeChildren = node.children;
    if (nodeChildren && nodeChildren?.length > 0) {
      printer.blockStart();
      for (let i = 0; i < nodeChildren.length; i++) {
        printer.print(nodeChildren[i], node);
        if (i !== nodeChildren.length - 1) {
          printer.newline();
        }
      }
      printer.blockEnd();
    }
  }
});

export const AtContent = defineType('AtContent', {
  fields: {},
  generate(printer, node, parent) {
    if (parent?.body?.indexOf(node) !== 0) {
      printer.maybeNewline();
    }
    printer.token('@content;');
  }
});

export const AtReturn = defineType('AtReturn', {
  fields: {
    argument: {
      validate: assertAny
    }
  },
  generate(printer, node, parent) {
    if (parent?.body?.indexOf(node) !== 0) {
      printer.maybeNewline();
    }
    printer.token('@return');
    printer.space();
    printer.print(node.argument, node);
    printer.token(';');
  }
});

//-------------------------------------------------------------------------------
// Assignment
//-------------------------------------------------------------------------------
export const Assignment = defineType('Assignment', {
  fields: {
    id: {
      validate: assertType(Identifier)
    },
    init: {
      validate: () =>
        assertOneOf([
          assertType(CallExpression),
          assertType(SassBoolean),
          assertType(SassColor),
          assertType(SassList),
          assertType(SassMap),
          assertType(SassNumber),
          assertType(SassString),
          assertType(SassFunctionCall)
        ])
    },
    default: {
      optional: true,
      validate: assertValueType('boolean')
    },
    global: {
      optional: true,
      validate: assertValueType('boolean')
    }
  },
  generate(printer, node, parent) {
    printer.print(node.id, node);
    printer.token(':');
    printer.space();
    printer.print(node.init, node);

    if (node.default) {
      printer.space();
      printer.token('!default');

      if (node.global) {
        printer.space();
      }
    }

    if (node.global) {
      printer.token('!global');
    }

    printer.token(';');

    if (parent) {
      // We have a couple of options for the block we may be operating in, in
      // this case we'll check for children or body and check if the collection
      // exists
      const collection = parent.children || parent.body;

      // If we have a collection, and there are more than one element in the
      // collection, then we can safely determine if we need to apply a newline
      // after an assignment. This scenario is quite hard to come by.

      /* v8 ignore next 11 */
      if (collection && collection.length > 1) {
        const assignments = collection.filter(
          (node) => node.type === Assignment.type
        );
        if (
          assignments.length === 1 ||
          assignments.indexOf(node) === assignments.length - 1
        ) {
          printer.newline();
        }
      }
    }
  }
});

export const AssignmentPattern = defineType('AssignmentPattern', {
  fields: {
    left: {
      validate: assertType(Identifier)
    },
    right: {
      validate: assertAny
    }
  },
  generate(printer, node) {
    printer.print(node.left, node);
    printer.token(':');
    printer.space();
    printer.print(node.right, node);
  }
});

export const RestPattern = defineType('RestPattern', {
  fields: {
    id: {
      validate: assertType(Identifier)
    }
  },
  generate(printer, node, parent) {
    printer.print(node.id, parent);
    printer.token('...');
  }
});

//-------------------------------------------------------------------------------
// Imports
//-------------------------------------------------------------------------------
export const SassImport = defineType('SassImport', {
  fields: {
    path: {
      validate: assertValueType('string')
    }
  },
  generate(printer, node) {
    printer.token('@import');
    printer.space();
    printer.token(`'${node.path}'`);
    printer.token(';');
  }
});

export const SassModule = defineType('SassModule', {
  fields: {
    path: {
      validate: assertValueType('string')
    }
  },
  generate(printer, node) {
    printer.token('@use');
    printer.space();
    printer.token(`'${node.path}'`);
    printer.token(';');
  }
});

export const SassForward = defineType('SassForward', {
  fields: {
    path: {
      validate: assertValueType('string')
    }
  },
  generate(printer, node) {
    printer.token('@forward');
    printer.space();
    printer.token(`'${node.path}'`);
    printer.token(';');
  }
});

//-------------------------------------------------------------------------------
// Control structures
//-------------------------------------------------------------------------------
export const IfStatement = defineType('IfStatement', {
  fields: {
    test: {
      validate: assertAny
    },
    consequent: {
      optional: true,
      validate: assertType(BlockStatement)
    },
    alternate: {
      optional: true,
      validate: () =>
        assertOneOf([assertType(IfStatement), assertType(BlockStatement)])
    }
  },
  generate(printer, node, parent) {
    if (parent && parent.type === IfStatement.type) {
      printer.space();
      printer.token('if');
    } else {
      printer.token('@if');
    }

    printer.space();
    printer.print(node.test, node);
    printer.print(node.consequent, node);

    if (node.alternate) {
      printer.token('@else');
      printer.print(node.alternate, node);
    }
  }
});

//-------------------------------------------------------------------------------
// Logical expressions
//-------------------------------------------------------------------------------
export const LogicalExpression = defineType('LogicalExpression', {
  fields: {
    left: {
      validate: assertAny
    },
    operator: {
      validate: assertValueType('string')
    },
    right: {
      validate: assertAny
    }
  },
  generate(printer, node) {
    printer.print(node.left, node);
    printer.space();
    printer.token(node.operator);
    printer.space();
    printer.print(node.right, node);
  }
});

//-------------------------------------------------------------------------------
// Call expressions
//-------------------------------------------------------------------------------
export const CallExpression = defineType('CallExpression', {
  fields: {
    callee: {
      validate: assertType(Identifier)
    },
    arguments: {
      optional: true,
      validate: arrayOf(assertAny)
    }
  },
  generate(printer, node) {
    printer.print(node.callee);
    printer.token('(');
    if (Array.isArray(node.arguments)) {
      for (let i = 0; i < node.arguments.length; i++) {
        printer.print(node.arguments[i], node);
        if (i !== node.arguments.length - 1) {
          printer.token(',');
          printer.space();
        }
      }
    }
    printer.token(')');
  }
});

//-------------------------------------------------------------------------------
// Formatting
//-------------------------------------------------------------------------------
export const Newline = defineType('Newline', {
  generate(printer) {
    printer.newline();
  }
});

//-------------------------------------------------------------------------------
// StyleSheet
//-------------------------------------------------------------------------------
export const StyleSheet = defineType('StyleSheet', {
  fields: {
    children: {
      validate: () =>
        arrayOf(
          assertOneOf([
            assertType(Assignment),
            assertType(AtRule),
            assertType(Comment),
            assertType(IfStatement),
            assertType(Rule),
            assertType(SassFunction),
            assertType(SassImport),
            assertType(SassMixin),
            assertType(SassMixinCall),
            assertType(Newline)
          ])
        )
    }
  },
  generate(printer, node) {
    const nodeChildren = node.children!;
    for (let i = 0; i < nodeChildren.length; i++) {
      printer.print(nodeChildren[i], node);
      if (i !== nodeChildren.length - 1) {
        printer.newline();
      }
    }
  }
});

export const pureTypes = {
  Assignment,
  AssignmentPattern,
  AtContent,
  AtReturn,
  AtRule,
  BlockStatement,
  CallExpression,
  Comment,
  Declaration,
  IfStatement,
  Identifier,
  LogicalExpression,
  RestPattern,
  Rule,
  SassBoolean,
  SassColor,
  SassForward,
  SassFunction,
  SassFunctionCall,
  SassImport,
  SassNumber,
  SassString,
  SassList,
  SassMap,
  SassMapProperty,
  SassModule,
  SassValue,
  SassMixin,
  SassMixinCall,
  StyleSheet,
  Newline
};

export const types = {
  Assignment: makeInvocableDefinition(Assignment),
  AssignmentPattern: makeInvocableDefinition(AssignmentPattern),
  AtContent: makeInvocableDefinition(AtContent),
  AtReturn: makeInvocableDefinition(AtReturn),
  AtRule: makeInvocableDefinition(AtRule),
  BlockStatement: makeInvocableDefinition(BlockStatement),
  CallExpression: makeInvocableDefinition(CallExpression),
  Comment: makeInvocableDefinition(Comment),
  Declaration: makeInvocableDefinition(Declaration),
  IfStatement: makeInvocableDefinition(IfStatement),
  Identifier: makeInvocableDefinition(Identifier),
  LogicalExpression: makeInvocableDefinition(LogicalExpression),
  RestPattern: makeInvocableDefinition(RestPattern),
  Rule: makeInvocableDefinition(Rule),
  SassBoolean: makeInvocableDefinition(SassBoolean),
  SassColor: makeInvocableDefinition(SassColor),
  SassForward: makeInvocableDefinition(SassForward),
  SassFunction: makeInvocableDefinition(SassFunction),
  SassFunctionCall: makeInvocableDefinition(SassFunctionCall),
  SassImport: makeInvocableDefinition(SassImport),
  SassNumber: makeInvocableDefinition(SassNumber),
  SassString: makeInvocableDefinition(SassString),
  SassList: makeInvocableDefinition(SassList),
  SassMap: makeInvocableDefinition(SassMap),
  SassMapProperty: makeInvocableDefinition(SassMapProperty),
  SassModule: makeInvocableDefinition(SassModule),
  SassValue: makeInvocableDefinition(SassValue),
  SassMixin: makeInvocableDefinition(SassMixin),
  SassMixinCall: makeInvocableDefinition(SassMixinCall),
  StyleSheet: makeInvocableDefinition(StyleSheet),
  Newline: makeInvocableDefinition(Newline)
};

export const definitions = Object.values(types);
