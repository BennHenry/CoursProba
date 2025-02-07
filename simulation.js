const { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } = Recharts;

const RandomWalkSimulation = () => {
  const [simData, setSimData] = React.useState([]);
  const [params, setParams] = React.useState({
    opt: 1,
    N: 1000,
    opt2: 0
  });
  const [animationSpeed, setAnimationSpeed] = React.useState(50);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [currentStep, setCurrentStep] = React.useState(0);

  const zeta = (s) => {
    let sum = 0;
    for (let k = 1; k < 1000; k++) {
      sum += 1 / Math.pow(k, s);
    }
    return sum;
  };

  const sim = (opt) => {
    switch (opt) {
      case 1: {
        const U = Math.random();
        return U > 0.5 ? 10 : -5;
      }
      case 0:
        return 1;
      case 2: {
        const ct = 1 / zeta(3);
        let U = Math.random();
        let p = ct;
        let k = 1;
        while (U > p) {
          k = k + 1;
          p = p + ct / (Math.pow(k, 3));
        }
        return k % 2 === 0 ? -k : k;
      }
      default: {
        let U = Math.random();
        const ct = 6 / (Math.PI * Math.PI);
        let p = ct;
        let k = 1;
        while (U > p) {
          k = k + 1;
          p = p + ct / (k * k);
        }
        return k % 2 === 0 ? -k : k;
      }
    }
  };

  const generateTrajectory = () => {
    let totCas = 0;
    const traj = [{ step: 0, value: 0, expected: 0 }];
    
    const a = params.opt === 1 ? 5/2 :
             params.opt === 0 ? 1 :
             params.opt === 2 ? Math.PI * Math.PI / (12 * zeta(3)) : 1;

    for (let i = 1; i <= params.N; i++) {
      totCas += sim(params.opt);
      traj.push({
        step: i,
        value: totCas,
        expected: a * i
      });
    }
    return traj;
  };

  React.useEffect(() => {
    const fullData = generateTrajectory();
    setSimData(fullData);
    setCurrentStep(0);
  }, [params]);

  React.useEffect(() => {
    let interval;
    if (isPlaying && currentStep < params.N) {
      interval = setInterval(() => {
        setCurrentStep(prev => Math.min(prev + 1, params.N));
      }, animationSpeed);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentStep, params.N, animationSpeed]);

  const displayData = simData.slice(0, currentStep + 1);

  return (
    <div className="p-4 space-y-4">
      <div className="space-y-2">
        <div className="flex space-x-4">
          <div>
            <label className="block text-sm font-medium">Simulation Type:</label>
            <select 
              className="mt-1 block w-full rounded border shadow-sm"
              value={params.opt}
              onChange={(e) => setParams(prev => ({ ...prev, opt: parseInt(e.target.value) }))}
            >
              <option value={0}>Constant</option>
              <option value={1}>Binary</option>
              <option value={2}>Zeta(3)</option>
              <option value={3}>Zeta(2)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium">Steps (N):</label>
            <input
              type="number"
              className="mt-1 block w-full rounded border shadow-sm"
              value={params.N}
              onChange={(e) => setParams(prev => ({ ...prev, N: parseInt(e.target.value) }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Animation Speed (ms):</label>
            <input
              type="number"
              className="mt-1 block w-full rounded border shadow-sm"
              value={animationSpeed}
              onChange={(e) => setAnimationSpeed(parseInt(e.target.value))}
            />
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={() => setIsPlaying(!isPlaying)}
          >
            {isPlaying ? 'Pause' : 'Play'}
          </button>
          <button
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            onClick={() => {
              setCurrentStep(0);
              setIsPlaying(false);
            }}
          >
            Reset
          </button>
        </div>
      </div>
      
      <div className="h-96">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={displayData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="step" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke="#8884d8" 
              name="Random Walk"
              dot={false}
            />
            <Line 
              type="monotone" 
              dataKey="expected" 
              stroke="#82ca9d" 
              name="Expected Value"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};