export interface ISetting {
    name: string;
    port: number;
    cronExpressionSync: string;
    mobilenet: IModel;
    faceDetection: IModel;
}

interface IModel {
    path: string;
    uri: string;
    minScore: number;
}