interface SubheadingProps {
  title: string;
  description: string;
}

export const Subheading: React.FC<SubheadingProps> = ({
  title,
  description
}) => {
  return ( 
    <div>
      <h2 className="text-xl font-bold tracking-tight">{title}</h2>
      <p className="text-sm text-muted-foreground">
        {description}
      </p>
    </div>
  );
};
 