import { useColorScheme } from '@mui/material/styles';
import { tawkeeLogo } from '../assets';
import { tawkeeLogoLight } from '../assets';

export default function TawkeeLogo() {
  const { mode, systemMode } = useColorScheme();

  const resolvedMode = (systemMode || mode) as 'light' | 'dark';

  const icon = {
    light: <img src={tawkeeLogoLight} alt="Tawkee Logo" />,
    dark: <img src={tawkeeLogo} alt="Tawkee Logo" />,
  }[resolvedMode];

  return icon;
}
