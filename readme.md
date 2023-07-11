It is because of the node-fetch package. As recent versions of this package only support ESM, you have to downgrade it to an older version node-fetch@2.6.1 or lower.
```
npm i node-fetch@2.6.1
```