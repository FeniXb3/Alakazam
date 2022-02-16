export function generateFlowchart() {
    return `            graph TD 
    active-node-A[Client] --> B[Load Balancer] 
    B --> C-active-node[Server1] 
    B --> D[Server2]`
}