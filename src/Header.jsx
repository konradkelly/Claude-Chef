import chefLogo from './assets/robot_chef.png'

export default function Header() {
  return (
    <header className="site-header">
      <img className="header-logo" src={chefLogo} alt="Chef Claude logo" />
      <h1 className="site-header__title">Chef Claude</h1>
    </header>
  )
}