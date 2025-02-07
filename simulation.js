const RandomWalkSimulation = () => {
  const [params, setParams] = React.useState({
    opt: 1,
    N: 1000,
  });
  const [animationSpeed, setAnimationSpeed] = React.useState(50);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [currentStep, setCurrentStep] = React.useState(0);
  const chartRef = React.useRef(null);
  const chartInstance = React.useRef(null);

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

  const generateTrajectory = React.useCallback(() => {
    let totCas = 0;
    const values = [0];
    const expected = [0];
    const steps = Array.from({length: params.N + 1}, (_, i) => i);
    
    const a = params.opt === 1 ? 5/2 :
             params.opt === 0 ? 1 :
             params.opt === 2 ? Math.PI * Math.PI / (12 * zeta(3)) : 1;

    for (let i = 1; i <= params.N; i++) {
      totCas += sim(params.opt);
      values.push(totCas);
      expected.push(a * i);
    }
    
    return { steps, values, expected };
  }, [params.N, params.opt]);

  const updateChart = React.useCallback(() => {
    if (chartRef.current) {
      const ctx = chartRef.current.getContext('2d');
      const { steps, values, expected } = generateTrajectory();

      if (chartInstance.current) {
        chartInstance.current.destroy();
      }

      chartInstance.current = new Chart(ctx, {
        type: 'line',
        data: {
          labels: steps.slice(0, currentStep + 1),
          datasets: [
            {
              label: 'Random Walk',
              data: values.slice(0, currentStep + 1),
              borderColor: 'rgb(75, 192, 192)',
              borderWidth: 2,
              pointRadius: 0
            },
            {
              label: 'Expected Value',
              data: expected.slice(0, currentStep + 1),
              borderColor: 'rgb(255, 99, 132)',
              borderWidth: 2,
              pointRadius: 0
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: false,
          scales: {
            y: {
              beginAtZero: false
            }
          },
          plugins: {
            legend: {
              position: 'top'
            }
          }
        }
      });
    }
  }, [generateTrajectory, currentStep]);

  React.useEffect(() => {
    updateChart();
  }, [updateChart]);

  React.useEffect(() => {
    let interval;
    if (isPlaying && currentStep < params.N) {
      interval = setInterval(() => {
        setCurrentStep(prev => Math.min(prev + 1, params.N));
      }, animationSpeed);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentStep, params.N, animationSpeed]);

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Random Walk Simulation</h1>
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Simulation Type:</label>
            <select 
              className="w-full rounded border shadow-sm p-2"
              value={params.opt}
              onChange={(e) => {
                setParams(prev => ({ ...prev, opt: parseInt(e.target.value) }));
                setCurrentStep(0);
                setIsPlaying(false);
              }}
            >
              <option value={0}>Constant</option>
              <option value={1}>Binary</option>
              <option value={2}>Zeta(3)</option>
              <option value={3}>Zeta(2)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Steps (N):</label>
            <input
              type="number"
              className="w-full rounded border shadow-sm p-2"
              value={params.N}
              onChange={(e) => {
                setParams(prev => ({ ...prev, N: Math.max(1, parseInt(e.target.value) || 0) }));
                setCurrentStep(0);
                setIsPlaying(false);
              }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Animation Speed (ms):</label>
            <input
              type="number"
              className="w-full rounded border shadow-sm p-2"
              value={animationSpeed}
              min="1"
              max="1000"
              onChange={(e) => setAnimationSpeed(Math.max(1, parseInt(e.target.value) || 50))}
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
        <div className="h-96 border rounded p-4">
          <canvas ref={chartRef}></canvas>
        </div>
      </div>
    </div>
  );
};