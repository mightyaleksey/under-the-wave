'use strict'

const props = {}
props.ArrayExpression =
['elements']
props.ArrowFunctionExpression =
props.FunctionDeclaration =
props.FunctionExpression =
['id', 'params', 'body']
props.AssignmentExpression =
props.BinaryExpression =
props.LogicalExpression =
['left', 'right']
props.AwaitExpression =
props.ReturnStatement =
props.YieldExpression =
['argument']
props.BlockStatement =
props.ClassBody =
props.LabeledStatement =
props.Program =
['body']
props.CallExpression =
props.NewExpression =
['callee', 'arguments']
props.CatchClause =
['param', 'body']
props.ChainExpression =
props.ExpressionStatement =
props.ParenthesizedExpression =
['expression']
props.ClassDeclaration =
props.ClassExpression =
['id', 'superClass', 'body']
props.ConditionalExpression =
['test', 'consequent', 'alternate']
props.DoWhileStatement =
props.WhileStatement =
['test', 'body']
props.ExportAllDeclaration =
['exported', 'source']
props.ExportDefaultDeclaration =
['declaration']
props.ExportNamedDeclaration =
['declaration', 'specifiers', 'source']
props.ExportSpecifier =
['local', 'exported']
props.ForInStatement =
props.ForOfStatement =
['left', 'right', 'body']
props.ForStatement =
['init', 'test', 'update', 'body']
props.IfStatement =
['test', 'consequent', 'alternate']
props.ImportDeclaration =
['specifiers', 'source']
props.ImportExpression =
['source']
props.MemberExpression =
['object', 'property']
props.MethodDefinition =
props.Property =
['key', 'value']
props.ObjectExpression =
['properties']
props.RestElement =
props.SpreadElement =
props.ThrowStatement =
props.UnaryExpression =
props.UpdateExpression =
['argument']
props.SequenceExpression =
['expressions']
props.SwitchCase =
['test', 'consequent']
props.SwitchStatement =
['discriminant', 'cases']
props.TaggedTemplateExpression =
['tag', 'quasi']
props.TemplateLiteral =
['quasis', 'expressions']
props.TryStatement =
['block', 'handler', 'finalizer']
props.VariableDeclaration =
['declarations']
props.VariableDeclarator =
['id', 'init']
props.WithStatement =
['object', 'body']
props.BreakStatement =
props.ContinueStatement =
props.DebuggerStatement =
props.EmptyStatement =
props.Identifier =
props.ImportDefaultSpecifier =
props.ImportNamespaceSpecifier =
props.ImportSpecifier =
props.Literal =
props.MetaProperty =
props.Super =
props.TemplateElement =
props.ThisExpression =
props.VariablePattern =
[] // skip

function walk (ast, plugins) {
  const enter = []
  const leave = []
  const fallback = []
  plugins.forEach(p => {
    if (typeof p.enter === 'function') enter.push(p.enter)
    if (typeof p.leave === 'function') leave.push(p.leave)
    if (typeof p.fallback === 'function') fallback.push(p.fallback)
  })

  const ancestors = []
  const api = {
    _: [],
    append (collection, node) {
      this._.push(node)
      collection.push(node)
    },
    insert (collection, position, node) {
      this._.push(node)
      collection.splice(position, 0, node)
    },
    remove () {
      const node = ancestors.pop()
      const parent = ancestors[ancestors.length - 1]

      iterateBranches(parent, props[parent.type], function removeBranch (child, key, container) {
        if (child === node) {
          if (Array.isArray(container)) container.splice(key, 1)
          else container[key] = null
          return true
        }
      })
    },
    replace (replacement) {
      const node = ancestors.pop()
      const parent = ancestors[ancestors.length - 1]

      iterateBranches(parent, props[parent.type], function replaceBranch (child, key, container) {
        if (child === node) {
          container[key] = replacement
          return true
        }
      })
    }
  }

  walkRecursive(api, ast, ancestors, {}, enter, leave, fallback)
}

function walkRecursive (api, node, ancestors, scope, enter, leave, fallback) {
  if (node == null) return
  ancestors.push(node)

  const keys = props[node.type]
  if (!Array.isArray(keys)) {
    for (const fn of fallback) fn(node, ancestors, scope)
    return
  }

  const addedBefore = api._.length

  for (const fn of enter) {
    const r = fn.call(api, node, ancestors, scope)
    if (typeof r === 'object') {
      r !== null ? api.replace(r) : api.remove()
      walkRecursive(api, r, ancestors, scope, enter, leave, fallback)
      return
    }
  }

  while (api._.length > addedBefore) api._.pop()

  iterateBranches(node, keys, function weNeedToGoDeeper (child) {
    walkRecursive(api, child, ancestors, scope, enter, leave, fallback)
  })

  for (const fn of leave) {
    const r = fn.call(api, node, ancestors, scope)
    if (typeof r === 'object') {
      r !== null ? api.replace(r) : api.remove()
      walkRecursive(api, r, ancestors, scope, enter, leave, fallback)
      return
    }
  }

  while (api._.length > 0) {
    walkRecursive(api, api._.shift(), ancestors, scope, enter, leave, fallback)
  }

  ancestors.pop()
}

function iterateBranches (node, keys, cb) {
  for (const key of keys) {
    if (!Array.isArray(node[key])) {
      if (cb(node[key], key, node) === true) return
      continue
    }

    const collection = node[key]
    let i = 0
    while (i < collection.length) {
      const child = collection[i]
      if (cb(child, i, collection) === true) return
      // since we do removal in place (mutation),
      // check if node wasn't removed before moving pointer
      if (child === collection[i]) ++i
    }
  }
}

module.exports = {
  walk
}
