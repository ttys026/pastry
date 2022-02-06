---
title: Pastry - A sweet copy and paste app for your macOS
sidemenu: false
---

## View Clipboard History

Press **⌘ + Shift + V** to pop up the clipboard history menu. Your cursor position will be saved in this way.

## Search Clipboard Entries

Press **⌘ + \`(The key on the left of digital 1)** to display the search window. Notice that the search window will take your cursor focus, so that after selecting an item, the item will be stored as your latest clipboard data instead of paste it immediately.

## Scripting Clipboard

You can write functions to customize the paste behavior.


```jsx | pure
(selection, histories, activeApp) => 'Hello World'

```

The function has three parameters, which are:

- the current selection.
- the clipboard histories.
- the current active application.

### Typical Use cases:

#### Paste your email address

```jsx | pure
() => 'my-email@example.com'

```
#### Console log variables with a specific random tag

```jsx | pure
(selection, histories) => {
  return ['console.log("pastry_', nanoid(3), '", { ', histories[0].text, ' });'].join('');
}
```

#### Transform selected text to camelCase

```jsx | pure
(selection) => {
  return _.camelCase(selection);
}
```
#### Get the stock price

```jsx | pure
(selection) => {
  return axios.get(`https://api.example.com/1.0/stock/${selection || 'aapl'}/price`)
    .then(res => res.data());
}
```
Examples above are just demos to inspire your creativity. You can achieve more by writing your own functions.