import React, { useState, useEffect } from 'react';
import './App.css';
import { fetchGoogleSheetData, convertSheetDataToRaidGroups } from './services/googleSheets';

interface RaidGroup {
  name: string;
  raids: Raid[];
}

interface Raid {
  name: string;
  members: string[];
}

interface RaidState {
  [groupName: string]: {
    [raidName: string]: {
      [memberName: string]: boolean;
    };
  };
}

const App: React.FC = () => {
  const [raidGroups, setRaidGroups] = useState<RaidGroup[]>([]);
  const [raidStates, setRaidStates] = useState<RaidState>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Obtener datos del Google Sheet
        const sheetData = await fetchGoogleSheetData();
        
        // Convertir a la estructura de la aplicación
        const raidGroupsData = convertSheetDataToRaidGroups(sheetData);
        
        console.log('Setting raid groups data:', raidGroupsData);
        setRaidGroups(raidGroupsData);
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Error al cargar los datos del Google Sheet');
        
        // Fallback a datos mock si falla la carga
        const mockData: RaidGroup[] = [
          {
            name: 'Mordum',
            raids: [
              { name: 'Spicy Meatball', members: ['Rathofdemise', 'Mauleigh', 'Dfordeez', 'Baelvy', 'Mike', 'Kayayadub', 'Ghostsayaftera'] },
              { name: 'Weekly Parse', members: ['Leroy', 'Jesseigh', 'Amess', 'Aelva', 'Kabuddy', 'Saleco', 'Pallyofdemise'] },
              { name: '99 Problems', members: ['Misteigh', 'Temran', 'Aelvyi', 'Kadubya', 'Mykaelangelow', 'Supportofdemise', 'Charleigh'] },
              { name: 'Cripple Fight', members: ['Celrog', 'Aelvjin', 'Kastabya', 'Backhurtssobad', 'Ipewpew', 'Ashley', 'Irlylor'] },
              { name: 'Too Many Cooks', members: ['Aelvipo', 'Kadub', 'Backhurtslegit', 'Gatezerofiller', 'Jaymeigh', 'Cephur', 'Aelveater'] },
              { name: 'The Leftovers', members: ['Kaslice', 'Backhurts', 'Mike', 'Mike', 'Mike', 'Mike', 'Mike'] }
            ]
          }
        ];
        setRaidGroups(mockData);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleMemberClick = (groupName: string, raidName: string, memberName: string) => {
    setRaidStates(prev => ({
      ...prev,
      [groupName]: {
        ...prev[groupName],
        [raidName]: {
          ...prev[groupName]?.[raidName],
          [memberName]: !prev[groupName]?.[raidName]?.[memberName]
        }
      }
    }));
  };

  const handleReset = () => {
    setRaidStates({});
  };

  const isMemberCompleted = (groupName: string, raidName: string, memberName: string) => {
    return raidStates[groupName]?.[raidName]?.[memberName] || false;
  };

  console.log('Current state - loading:', loading, 'error:', error, 'raidGroups:', raidGroups);

  if (loading) {
    return (
      <div className="app">
        <h1>Raid Groups</h1>
        <div style={{ textAlign: 'center', color: 'white', fontSize: '1.2rem', marginTop: '50px' }}>
          Cargando datos del Google Sheet...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app">
        <h1>Raid Groups</h1>
        <div style={{ textAlign: 'center', color: '#e74c3c', fontSize: '1.2rem', marginTop: '50px' }}>
          {error}
        </div>
        <div style={{ textAlign: 'center', color: 'white', fontSize: '1rem', marginTop: '20px' }}>
          Mostrando datos de respaldo...
        </div>
      </div>
    );
  }

  console.log('Rendering main component with', raidGroups.length, 'groups');

  return (
    <div className="app">
      <h1>Raid Groups</h1>
      <div className="controls">
        <button onClick={handleReset} className="reset-button">Reset All States</button>
      </div>
      <div className="raid-groups">
        {raidGroups.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'white', fontSize: '1.2rem', marginTop: '50px' }}>
            No se encontraron grupos de raids
          </div>
        ) : (
          raidGroups.map(group => (
          <div key={group.name} className="raid-group">
            <h2>{group.name}</h2>
            <div className="raids">
              {group.raids.map(raid => (
                <div key={raid.name} className="raid">
                  <h3>{raid.name}</h3>
                  <div className="members">
                    {raid.members.map(member => (
                      <div
                        key={member}
                        className={`member ${isMemberCompleted(group.name, raid.name, member) ? 'completed' : ''}`}
                        onClick={() => handleMemberClick(group.name, raid.name, member)}
                      >
                        {member}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
        )}
      </div>
    </div>
  );
};

export default App;