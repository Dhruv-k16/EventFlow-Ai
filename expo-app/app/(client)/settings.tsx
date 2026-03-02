import SharedSettings from '../../components/SharedSettings'; // ✅ Fixed: was ../components/

export default function Settings() {
  return <SharedSettings role="Client" initialName="Jordan Client" />;
}
