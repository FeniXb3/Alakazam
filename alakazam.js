export function generateFlowchart() {
    return `            graph TD 
    current[Client] --> B[Load Balancer] 
    B --> C[Server1] 
    B --> D[Server2]`
}