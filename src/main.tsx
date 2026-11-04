import React from 'react'
import ReactDOM from 'react-dom/client'
import SiteRouter from './SiteRouter'
import '@fontsource-variable/nunito-sans/wght.css'
import './styles.css'
import './jungle.css'
import '@fontsource-variable/fredoka/wght.css'
import './organic.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode><SiteRouter /></React.StrictMode>,
)
