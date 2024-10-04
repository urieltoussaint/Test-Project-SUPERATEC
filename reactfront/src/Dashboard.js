import React from 'react';
import { Container, Grid, Paper } from '@mui/material';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip} from 'recharts';

const data = [
  { name: 'Jan', uv: 4000 },
  { name: 'Feb', uv: 3000 },
  { name: 'Mar', uv: 2000 },
  { name: 'Apr', uv: 2780 },
  { name: 'May', uv: 1890 },
];

export default function Dashboard() {
  return (
    <Container maxWidth="lg">
      <Grid container spacing={3}>
        {/* Chart */}
        <Grid item xs={12} md={8}>
          <Paper>
            <h3>Sales Overview</h3>
            <LineChart width={600} height={300} data={data}>
              <Line type="monotone" dataKey="uv" stroke="#8884d8" />
              <CartesianGrid stroke="#ccc" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
            </LineChart>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}
