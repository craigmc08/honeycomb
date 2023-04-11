import PropTypes from 'prop-types';

import './Tag.css';

function Tag(props) {
  const tag = props.tags.find(t => t.slug === props.slug);
  return (
    <div className="recipe-tag" style={{ '--tag-hue': tag.color }}>{tag.tag}</div>
  );
}

Tag.propTypes = {
  tags: PropTypes.array,
  slug: PropTypes.string.isRequired,
};

export default Tag;
