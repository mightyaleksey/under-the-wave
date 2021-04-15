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

function walk (ast, plugins, statePlugin) {
  if (!Array.isArray(plugins)) plugins = [plugins]

  const enter = []
  const leave = []
  const fallback = []
  plugins.forEach(p => {
    if (typeof p.enter === 'function') enter.push(p.enter)
    if (typeof p.leave === 'function') leave.push(p.leave)
    if (typeof p.fallback === 'function') fallback.push(p.fallback)
  })

  const buildState = statePlugin?.enter
  const cleanState = statePlugin?.leave

  const stack = [ast]
  const leaveStack = []
  const leaveToken = Symbol('leave')
  let node = null
  let state

  const api = {
    _: [],
    append (collection, node) {
      collection.push(node)
      this._.push(node)
    },
    insert (collection, position, node) {
      collection.splice(position, 0, node)
      this._.push(node)
    },
    remove () {
      iterateChildren(leaveStack[leaveStack.length - 1], (child, key, parent) => {
        if (child === node) {
          if (Array.isArray(parent)) parent.splice(key, 1)
          return true
        }
      })
    },
    replace (replacement) {
      iterateChildren(leaveStack[leaveStack.length - 1], (child, key, parent) => {
        if (child === node) {
          parent[key] = replacement
          return true
        }
      })

      this._.push(replacement)
    }
  }

  while (stack.length > 0) {
    node = stack.pop()

    if (node === leaveToken) {
      node = leaveStack.pop()

      // leave hook
      const ret = composeHooks(leave, api, node, leaveStack[leaveStack.length - 1], state)
      if (ret !== undefined) {
        if (Array.isArray(ret)) {
          while (ret.length > 0) stack.push(ret.pop())
        } else if (ret !== null) {
          stack.push(ret)
        }
      }

      if (
        cleanState != null &&
        (ret === undefined || Array.isArray(ret))
      ) state = cleanState(node, leaveStack[leaveStack.length - 1], state)

      continue
    }

    if (props[node.type] == null) {
      for (const fn of fallback) fn(node, leaveStack[leaveStack.length - 1])
      continue
    }

    // enter hook
    const ret = composeHooks(enter, api, node, leaveStack[leaveStack.length - 1], state)
    if (ret !== undefined) {
      if (Array.isArray(ret)) {
        while (ret.length > 0) ret.pop()
      } else {
        ret !== null && stack.push(ret)
        // skip leave token addition for remove, replace cases
        // we don't need to call leave hook on a removed or replaced nodes on this step
        continue
      }
    }

    if (buildState != null) state = buildState(node, leaveStack[leaveStack.length - 1], state)

    leaveStack.push(node)
    stack.push(leaveToken)

    iterateChildren(node, child => { child != null && stack.push(child) })
  }
}

module.exports = {
  walk
}

function iterateChildren (node, cb) {
  // from end to start
  if (node == null) return
  const keys = props[node.type]
  let branch = keys.length
  while (branch--) {
    const elem = node[keys[branch]]
    if (!Array.isArray(elem)) {
      if (cb(elem, keys[branch], node) === true) return
      continue
    }

    let i = elem.length
    while (i--) if (cb(elem[i], i, elem) === true) return
  }
}

function composeHooks (hooks, api, node, parent, scope) {
  for (let i = 0; i < hooks.length; ++i) {
    const ret = hooks[i].call(api, node, parent, scope)
    // todo handle direct call of api.remove / api.replace
    if (api._.length > 0) {
      return api._
    }
    if (typeof ret === 'object') {
      ret === null ? api.remove() : api.replace(ret)
      return ret
    }
  }
}
